// src/components/chat/EnhancedChatSidebar.tsx
import { Plus, Settings2, Ticket } from "lucide-react";
import { Agent, DEFAULT_AGENTS } from "@/types/chat";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AgentImprover } from "./AgentImprover";
import { MCPToolsSettings } from "@/components/mcp/MCPToolsSettings";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

interface EnhancedChatSidebarProps {
  selectedAgent: Agent;
  onSelectAgent: (agent: Agent) => void;
  onNewChat: () => void;
  onPromptUpdate: (newPrompt: string) => void;
  
  // MCP
  enabledMCPTools: Set<string>;
  onToggleMCPTool: (toolId: string) => void;
  
  // Support
  openTickets: number;
  onViewTickets: () => void;
  
  // Context Switching
  autoContextSwitch: boolean;
  onToggleAutoContext: (enabled: boolean) => void;
  currentIntent?: string;
}

export function EnhancedChatSidebar({
  selectedAgent,
  onSelectAgent,
  onNewChat,
  onPromptUpdate,
  enabledMCPTools,
  onToggleMCPTool,
  openTickets,
  onViewTickets,
  autoContextSwitch,
  onToggleAutoContext,
  currentIntent,
}: EnhancedChatSidebarProps) {
  return (
    <div className="w-72 h-full flex flex-col bg-sidebar border-r border-sidebar-border">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <h1 className="text-xl font-semibold gradient-text">Universal Chat</h1>
        <p className="text-xs text-muted-foreground mt-1">AI-powered conversations</p>
        
        {currentIntent && (
          <Badge variant="outline" className="mt-2 text-[10px]">
            Intent: {currentIntent}
          </Badge>
        )}
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

      <ScrollArea className="flex-1 px-2">
        {/* Agents Section */}
        <div className="px-1 py-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
            Agents
          </p>
        </div>

        <div className="space-y-1 mb-4">
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
                <p className="text-xs text-muted-foreground truncate">
                  {agent.description}
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* Self-Improvement */}
        <div className="px-1 mb-4">
          <AgentImprover agent={selectedAgent} onPromptUpdate={onPromptUpdate} />
        </div>

        {/* MCP Tools */}
        <div className="px-1 mb-4">
          <MCPToolsSettings
            enabledTools={enabledMCPTools}
            onToggleTool={onToggleMCPTool}
          />
        </div>

        {/* Context Switching */}
        <div className="glass-panel rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings2 className="h-4 w-4 text-primary" />
              <span className="font-medium text-sm">Auto Context</span>
            </div>
            <Switch
              checked={autoContextSwitch}
              onCheckedChange={onToggleAutoContext}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Automatically switch agents based on your message intent
          </p>
        </div>

        {/* Support Tickets */}
        <div className="px-1">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-between"
            onClick={onViewTickets}
          >
            <div className="flex items-center gap-2">
              <Ticket className="h-4 w-4" />
              <span className="text-sm">Support Tickets</span>
            </div>
            {openTickets > 0 && (
              <Badge variant="destructive" className="ml-2">
                {openTickets}
              </Badge>
            )}
          </Button>
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="pulse-dot" />
          <span>Powered by Lovable AI</span>
        </div>
        {enabledMCPTools.size > 0 && (
          <div className="mt-2">
            <Badge variant="outline" className="text-[10px]">
              {enabledMCPTools.size} MCP tools active
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
}