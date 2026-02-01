import { useState } from "react";
import { useLocation } from "wouter";
import { useCreateInterview } from "@/hooks/use-interviews";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertInterviewSchema, type InsertInterview } from "@shared/schema";
import { motion } from "framer-motion";
import { Bot, Sparkles, ArrowRight, Loader2, Briefcase, FileText, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

// Schema refinement for client-side form if needed (optional)
const formSchema = insertInterviewSchema;

export default function LandingPage() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const createInterview = useCreateInterview();

  const form = useForm<InsertInterview>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      candidateName: "",
      resumeText: "",
      jobDescription: "",
    },
  });

  const onSubmit = (data: InsertInterview) => {
    createInterview.mutate(data, {
      onSuccess: (interview) => {
        toast({
            title: "Interview Created",
            description: "Preparing your AI interviewer...",
        });
        setLocation(`/interview/${interview.id}`);
      },
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Failed to start interview.",
        });
      },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-background flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-5xl grid lg:grid-cols-2 gap-12 items-center"
        >
          {/* Left Column: Text */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold">
                <Sparkles className="w-4 h-4" />
                <span>AI-Powered Prep</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-display font-bold text-foreground leading-tight">
                Master Your Next <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                  Tech Interview
                </span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
                Practice with an AI interviewer that adapts to your resume and the job description. Get real-time feedback on your answers, structure, and tone.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-card p-4 rounded-xl border border-border shadow-sm">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mb-3">
                        <Bot className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-foreground">Real-time Feedback</h3>
                    <p className="text-sm text-muted-foreground mt-1">Instant analysis of your STAR method usage.</p>
                </div>
                <div className="bg-card p-4 rounded-xl border border-border shadow-sm">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center mb-3">
                        <FileText className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-foreground">Resume Tailored</h3>
                    <p className="text-sm text-muted-foreground mt-1">Questions specific to your experience.</p>
                </div>
            </div>
          </div>

          {/* Right Column: Form */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Card className="border-border shadow-xl shadow-primary/5 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent" />
              <CardHeader>
                <CardTitle className="text-2xl">Start a Session</CardTitle>
                <CardDescription>Enter details to generate your custom interview.</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="candidateName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                             <User className="w-4 h-4 text-primary" /> Candidate Name
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" className="bg-background" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="resumeText"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                             <FileText className="w-4 h-4 text-primary" /> Paste Resume Content
                          </FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Summary, Experience, Skills..." 
                              className="bg-background min-h-[100px] resize-none" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription className="text-xs">
                            Paste text from your PDF/Word resume.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="jobDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                             <Briefcase className="w-4 h-4 text-primary" /> Target Job Description
                          </FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Job responsibilities, requirements..." 
                              className="bg-background min-h-[100px] resize-none" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full text-lg h-12 font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
                      disabled={createInterview.isPending}
                    >
                      {createInterview.isPending ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" /> 
                          Initializing...
                        </>
                      ) : (
                        <>
                          Start Interview <ArrowRight className="w-5 h-5 ml-2" />
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
