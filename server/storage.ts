import {
  interviews,
  messages,
  type Interview,
  type InsertInterview,
  type Message,
  type InsertMessage,
} from "@shared/schema";
import { db } from "./db";
import { eq, asc } from "drizzle-orm";

export interface IStorage {
  createInterview(interview: InsertInterview): Promise<Interview>;
  getInterview(id: number): Promise<Interview | undefined>;
  updateInterview(id: number, partial: Partial<Interview>): Promise<Interview>;
  createMessage(message: InsertMessage): Promise<Message>;
  getMessages(interviewId: number): Promise<Message[]>;
  updateMessage(id: number, partial: Partial<Message>): Promise<Message>;
}

export class DatabaseStorage implements IStorage {
  async createInterview(interview: InsertInterview): Promise<Interview> {
    const [newInterview] = await db
      .insert(interviews)
      .values(interview)
      .returning();
    return newInterview;
  }

  async getInterview(id: number): Promise<Interview | undefined> {
    const [interview] = await db
      .select()
      .from(interviews)
      .where(eq(interviews.id, id));
    return interview;
  }

  async updateInterview(
    id: number,
    partial: Partial<Interview>,
  ): Promise<Interview> {
    const [updated] = await db
      .update(interviews)
      .set(partial)
      .where(eq(interviews.id, id))
      .returning();
    return updated;
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db
      .insert(messages)
      .values(message)
      .returning();
    return newMessage;
  }

  async getMessages(interviewId: number): Promise<Message[]> {
    return db
      .select()
      .from(messages)
      .where(eq(messages.interviewId, interviewId))
      .orderBy(asc(messages.createdAt));
  }

  async updateMessage(
    id: number,
    partial: Partial<Message>,
  ): Promise<Message> {
    const [updated] = await db
      .update(messages)
      .set(partial)
      .where(eq(messages.id, id))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
