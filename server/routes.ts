import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import OpenAI from "openai";
import { insertInterviewSchema } from "@shared/schema";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

const SYSTEM_PROMPT_BASE = `
You are an AI Interviewer designed to simulate a real-world technical job interview.

GOAL:
Evaluate a candidate’s interview readiness for a specific tech role using their Resume and Job Description (JD).

YOUR RESPONSIBILITIES:
1. RESUME & JD ANALYSIS: Map resume skills to JD requirements.
2. QUESTION GENERATION: Ask technical, conceptual, behavioral, and scenario-based questions. Start EASY and progressively increase difficulty.
3. ADAPTIVE DIFFICULTY: Increase if response is strong, maintain/reduce if weak.
4. RESPONSE EVALUATION: Score each answer objectively (Accuracy, Clarity, Depth, Relevance). Check for STAR/PREP methods.
5. INTERVIEW CONTROL: End interview if performance drops consistently or after sufficient questions.

OUTPUT FORMAT:
You must ALWAYS respond in JSON format.
{
  "next_message": "The text of your next question or comment to the candidate.",
  "analysis": {
    "structure": "STAR" | "PREP" | "None",
    "missingComponents": ["Result", "Action", etc],
    "structureScore": 0-10,
    "improvementSuggestion": "One line suggestion",
    "accuracy": 0-3,
    "clarity": 0-2,
    "depth": 0-2,
    "relevance": 0-2,
    "timeEfficiency": 0-1,
    "totalScore": 0-10,
    "personalityType": "Nervous but capable" | "Confident and clear" | "Overconfident" | "Silent thinker" | "Inconsistent",
    "interviewerTone": "Recommended tone (e.g., Encouraging, Direct)",
    "pacingAdjustment": "Increase / Maintain / Decrease"
  },
  "is_complete": boolean
}

If this is the FIRST message (start of interview), "analysis" should be null.
If the interview is complete, "next_message" should be a closing statement, and "is_complete" should be true.
`;

const FINAL_REPORT_PROMPT = `
The interview is complete. Generate a final detailed report in JSON format:
{
  "readinessScore": 0-100,
  "verdict": "Strong" | "Average" | "Needs Improvement",
  "strengths": ["string", "string"],
  "weaknesses": ["string", "string"],
  "suggestions": ["string", "string"],
  "skillBreakdown": { "skillName": score_0_10 }
}
`;

export async function registerRoutes(
  httpServer: Server,
  app: Express,
): Promise<Server> {
  // Create Interview
  app.post(api.interviews.create.path, async (req, res) => {
    try {
      const input = insertInterviewSchema.parse(req.body);
      const interview = await storage.createInterview(input);
      res.status(201).json(interview);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join("."),
        });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get Interview & Messages
  app.get(api.interviews.get.path, async (req, res) => {
    const id = Number(req.params.id);
    const interview = await storage.getInterview(id);
    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }
    const messages = await storage.getMessages(id);
    res.json({ interview, messages });
  });

  // Next Step (Answer & Get Question)
  app.post(api.interviews.next.path, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { userResponse } = req.body;
      
      const interview = await storage.getInterview(id);
      if (!interview) {
        return res.status(404).json({ message: "Interview not found" });
      }

      // If user provided a response, save it
      if (userResponse) {
        await storage.createMessage({
          interviewId: id,
          role: "user",
          content: userResponse,
          type: "answer",
        });
      }

      // Fetch history for context
      const history = await storage.getMessages(id);
      
      // Construct prompt
      const messages = [
        {
          role: "system" as const,
          content: `${SYSTEM_PROMPT_BASE}\n\nCandidate Resume: ${interview.resumeText}\nJob Description: ${interview.jobDescription}\nCandidate Name: ${interview.candidateName}`,
        },
        ...history.map(m => ({
          role: (m.role === "assistant" ? "assistant" : "user") as "assistant" | "user",
          content: m.content,
        }))
      ];

      // Call OpenAI
      const response = await openai.chat.completions.create({
        model: "gpt-5.2",
        messages: messages,
        response_format: { type: "json_object" },
      });

      const aiContent = response.choices[0].message.content || "{}";
      let parsed;
      try {
        parsed = JSON.parse(aiContent);
      } catch (e) {
        console.error("Failed to parse AI response", aiContent);
        parsed = { next_message: "I apologize, I encountered an error. Please continue.", analysis: null, is_complete: false };
      }

      // If analysis exists, it belongs to the *previous* user message. 
      // We should update the last user message with this analysis.
      if (parsed.analysis && userResponse) {
        // Let's refetch the latest user message to update it
        const userMsgs = await storage.getMessages(id);
        const lastUserMsg = userMsgs.filter(m => m.role === "user").pop();
        if (lastUserMsg) {
             await storage.updateMessage(lastUserMsg.id, {
                 analysis: parsed.analysis
             });
        }
      }

      // Save AI Response
      const aiMessage = await storage.createMessage({
        interviewId: id,
        role: "assistant",
        content: parsed.next_message,
        type: "question",
      });

      if (parsed.is_complete) {
        await storage.updateInterview(id, { status: "completed" });
      } else {
        await storage.updateInterview(id, { 
            status: "in_progress",
            currentQuestionIndex: (interview.currentQuestionIndex || 0) + 1 
        });
      }

      res.json({
        message: aiMessage,
        analysis: parsed.analysis // Return analysis so frontend can show it immediately
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Complete Interview & Generate Report
  app.post(api.interviews.complete.path, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const interview = await storage.getInterview(id);
      if (!interview) {
        return res.status(404).json({ message: "Interview not found" });
      }

      const history = await storage.getMessages(id);
      
      const messages = [
        {
          role: "system" as const,
          content: `${SYSTEM_PROMPT_BASE}\n${FINAL_REPORT_PROMPT}\n\nCandidate Resume: ${interview.resumeText}\nJob Description: ${interview.jobDescription}`,
        },
        ...history.map(m => ({
          role: (m.role === "assistant" ? "assistant" : "user") as "assistant" | "user",
          content: m.content,
        })),
        {
          role: "user" as const,
          content: "The interview is over. Please generate the final report JSON."
        }
      ];

      const response = await openai.chat.completions.create({
        model: "gpt-5.2",
        messages: messages,
        response_format: { type: "json_object" },
      });

      const aiContent = response.choices[0].message.content || "{}";
      let report;
      try {
        report = JSON.parse(aiContent);
      } catch (e) {
        report = { readinessScore: 0, verdict: "Error", strengths: [], weaknesses: [], suggestions: [] };
      }

      const updated = await storage.updateInterview(id, {
        status: "completed",
        feedback: report,
        scores: { 
            total: report.readinessScore, 
            accuracy: 0, clarity: 0, depth: 0, relevance: 0, timeEfficiency: 0 // placeholders
        }
      });

      res.json(updated);

    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  return httpServer;
}
