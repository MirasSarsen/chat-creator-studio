// src/types/context.ts
export type UserIntent = 
  | "coding"
  | "writing"
  | "analysis"
  | "support"
  | "creative"
  | "technical"
  | "conversational"
  | "research";

export interface ContextSwitch {
  previousAgent: string;
  newAgent: string;
  previousIntent: UserIntent;
  newIntent: UserIntent;
  confidence: number;
  reason: string;
  timestamp: Date;
}

export interface DetectedIntent {
  intent: UserIntent;
  confidence: number;
  suggestedAgent: string;
  keywords: string[];
}

// Intent patterns for detection
export const INTENT_PATTERNS: Record<UserIntent, {
  keywords: string[];
  agentId: string;
  description: string;
}> = {
  coding: {
    keywords: ["code", "bug", "function", "class", "debug", "error", "algorithm", "programming", "syntax"],
    agentId: "coder",
    description: "Programming and development tasks",
  },
  writing: {
    keywords: ["write", "essay", "article", "story", "email", "letter", "draft", "compose"],
    agentId: "writer",
    description: "Creative and professional writing",
  },
  analysis: {
    keywords: ["analyze", "data", "statistics", "chart", "graph", "trends", "metrics", "insights"],
    agentId: "analyst",
    description: "Data analysis and interpretation",
  },
  support: {
    keywords: ["help", "issue", "problem", "broken", "not working", "error message", "ticket"],
    agentId: "general",
    description: "Support and troubleshooting",
  },
  creative: {
    keywords: ["creative", "imagine", "design", "brainstorm", "idea", "concept", "art"],
    agentId: "writer",
    description: "Creative ideation and design",
  },
  technical: {
    keywords: ["architecture", "system", "infrastructure", "deployment", "performance", "optimization"],
    agentId: "coder",
    description: "Technical architecture and systems",
  },
  conversational: {
    keywords: ["chat", "talk", "discuss", "opinion", "think", "feel", "what do you"],
    agentId: "general",
    description: "General conversation",
  },
  research: {
    keywords: ["research", "study", "investigate", "explore", "learn about", "find information"],
    agentId: "analyst",
    description: "Research and information gathering",
  },
};