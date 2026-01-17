export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  icon: string;
  prompt: string;
}

export interface Model {
  id: string;
  name: string;
  description: string;
  provider: "google" | "openai";
}

export const AVAILABLE_MODELS: Model[] = [
  {
    id: "google/gemini-3-flash-preview",
    name: "Gemini 3 Flash",
    description: "Fast & balanced",
    provider: "google",
  },
  {
    id: "google/gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    description: "Quick responses",
    provider: "google",
  },
  {
    id: "google/gemini-2.5-pro",
    name: "Gemini 2.5 Pro",
    description: "Best reasoning",
    provider: "google",
  },
  {
    id: "openai/gpt-5-mini",
    name: "GPT-5 Mini",
    description: "Balanced performance",
    provider: "openai",
  },
  {
    id: "openai/gpt-5",
    name: "GPT-5",
    description: "Most capable",
    provider: "openai",
  },
];

export const DEFAULT_AGENTS: Agent[] = [
  {
    id: "general",
    name: "General Assistant",
    description: "Helpful for any task",
    icon: "🤖",
    prompt: "You are a helpful AI assistant. Keep answers clear, concise, and engaging. Use markdown formatting when appropriate.",
  },
  {
    id: "coder",
    name: "Code Expert",
    description: "Programming help",
    icon: "💻",
    prompt: "You are an expert programmer. Help with code, debugging, and technical explanations. Always provide clean, well-commented code examples.",
  },
  {
    id: "writer",
    name: "Creative Writer",
    description: "Writing & creativity",
    icon: "✍️",
    prompt: "You are a creative writing assistant. Help with stories, articles, emails, and any creative content. Be imaginative and engaging.",
  },
  {
    id: "analyst",
    name: "Data Analyst",
    description: "Analysis & insights",
    icon: "📊",
    prompt: "You are a data analyst. Help interpret data, suggest analyses, and explain findings clearly. Be precise and data-driven.",
  },
];
