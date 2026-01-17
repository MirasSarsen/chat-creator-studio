// src/types/support.ts
export type TicketPriority = "low" | "medium" | "high" | "urgent";
export type TicketStatus = "open" | "in_progress" | "waiting" | "resolved" | "closed";
export type TicketCategory = "technical" | "billing" | "general" | "feature_request" | "bug";

export interface Ticket {
  id: string;
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  assignedAgent?: string;
  userId?: string;
  conversationId?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  metadata?: Record<string, any>;
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  role: "user" | "agent" | "system";
  content: string;
  createdAt: Date;
}

export interface SupportAgent {
  id: string;
  name: string;
  specialties: TicketCategory[];
  availableLoad: number; // 0-100, how many tickets they can handle
  currentTickets: number;
}

export const SUPPORT_AGENTS: SupportAgent[] = [
  {
    id: "tech-support",
    name: "Technical Support Agent",
    specialties: ["technical", "bug"],
    availableLoad: 100,
    currentTickets: 0,
  },
  {
    id: "billing-support",
    name: "Billing Support Agent",
    specialties: ["billing"],
    availableLoad: 100,
    currentTickets: 0,
  },
  {
    id: "general-support",
    name: "General Support Agent",
    specialties: ["general", "feature_request"],
    availableLoad: 100,
    currentTickets: 0,
  },
];