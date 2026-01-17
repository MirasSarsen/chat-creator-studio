import { Plus } from "lucide-react";
import { Agent, DEFAULT_AGENTS } from "@/types/chat";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AgentImprover } from "./AgentImprover";

interface ChatSidebarProps {
  selectedAgent: Agent;
  onSelectAgent: (agent: Agent) => void;
  onNewChat: () => void;
  onPromptUpdate: (newPrompt: string) => void;
}

export function ChatSidebar({ 
  selectedAgent, 
  onSelectAgent, 
  onNewChat,
  onPromptUpdate 
}: ChatSidebarProps) {
  return (
    <div className="w-72 h-full flex flex-col bg-sidebar border-r border-sidebar-border">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <h1 className="text-xl font-semibold gradient-text">Universal Chat</h1>
        <p className="text-xs text-muted-foreground mt-1">AI-powered conversations</p>
      </div>

      {/* New Chat Button */}
      <div className="p-3">
        <Button
          onClick={onNewChat}
          className="w-full justify-start gap-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20"
          variant="ghost"
        >
          <Plus className="w-4 h-4" />
          New Chat
        </Button>
      </div>

      {/* Agents Section */}
      <div className="px-3 py-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
          Agents
        </p>
      </div>

      <ScrollArea className="flex-1 px-2">
        <div className="space-y-1">
          {DEFAULT_AGENTS.map((agent) => (
            <button
              key={agent.id}
              onClick={() => onSelectAgent(agent)}
              className={`w-full sidebar-item ${
                selectedAgent.id === agent.id ? "sidebar-item-active" : ""
              }`}
            >
              <span className="text-lg">{agent.icon}</span>
              <div className="flex-1 text-left">
                <p className="font-medium text-sm">{agent.name}</p>
                <p className="text-xs text-muted-foreground truncate">{agent.description}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Self-Improvement Section */}
        <div className="mt-4 px-1">
          <AgentImprover 
            agent={selectedAgent} 
            onPromptUpdate={onPromptUpdate}
          />
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="pulse-dot" />
          <span>Powered by Lovable AI</span>
        </div>
      </div>
    </div>
  );
}
