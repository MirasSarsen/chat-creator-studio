// src/pages/EnhancedIndex.tsx
import { useState } from "react";
import { EnhancedChatSidebar } from "@/components/chat/EnhancedChatSidebar";
import { ChatArea } from "@/components/chat/ChatArea";
import { TicketsDialog } from "@/components/support/TicketsDialog";
import { useEnhancedChat } from "@/hooks/useEnhancedChat";
import { useTTS } from "@/hooks/useTTS";
import { toast } from "sonner";

const EnhancedIndex = () => {
  const {
    messages,
    isLoading,
    selectedModel,
    selectedAgent,
    setSelectedModel,
    setSelectedAgent,
    updateAgentPrompt,
    sendMessage,
    clearMessages,
    mcp,
    support,
    context,
    autoContextSwitch,
    setAutoContextSwitch,
  } = useEnhancedChat();

  const { speak, isSpeaking } = useTTS();
  const [showTickets, setShowTickets] = useState(false);

  // Count open tickets
  const openTickets = support.tickets.filter(
    t => t.status === "open" || t.status === "in_progress"
  ).length;

  // Handle MCP tool execution from chat
  const handleMCPExecution = async (tool: string, action: string, params: any) => {
    try {
      const result = await mcp.executeMCPAction({
        tool,
        action,
        parameters: params,
      });
      
      toast.success(`${tool} action completed successfully`);
      return result;
    } catch (error) {
      toast.error(`Failed to execute ${tool} action`);
      throw error;
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Ambient glow effect */}
      <div
        className="fixed inset-0 pointer-events-none opacity-50"
        style={{ background: "var(--gradient-glow)" }}
      />

      {/* Enhanced Sidebar */}
      <EnhancedChatSidebar
        selectedAgent={selectedAgent}
        onSelectAgent={(agent) => {
          setSelectedAgent(agent);
          clearMessages();
        }}
        onNewChat={clearMessages}
        onPromptUpdate={updateAgentPrompt}
        enabledMCPTools={mcp.enabledTools}
        onToggleMCPTool={mcp.toggleTool}
        openTickets={openTickets}
        onViewTickets={() => setShowTickets(true)}
        autoContextSwitch={autoContextSwitch}
        onToggleAutoContext={setAutoContextSwitch}
        currentIntent={context.currentIntent}
      />

      {/* Main Chat Area */}
      <ChatArea
        messages={messages}
        isLoading={isLoading}
        selectedModel={selectedModel}
        selectedAgent={selectedAgent}
        onSendMessage={sendMessage}
        onSelectModel={setSelectedModel}
        onSpeak={speak}
        isSpeaking={isSpeaking}
      />

      {/* Support Tickets Dialog */}
      <TicketsDialog
        open={showTickets}
        onOpenChange={setShowTickets}
        tickets={support.tickets}
        onLoadTickets={support.loadTickets}
        onUpdateStatus={support.updateTicketStatus}
      />

      {/* Context Switch Indicator */}
      {context.isAnalyzing && (
        <div className="fixed bottom-4 left-80 glass-panel px-4 py-2 rounded-lg animate-pulse">
          <p className="text-xs text-primary">Analyzing context...</p>
        </div>
      )}

      {/* MCP Execution Indicator */}
      {mcp.isExecuting && (
        <div className="fixed bottom-4 left-80 glass-panel px-4 py-2 rounded-lg animate-pulse">
          <p className="text-xs text-primary">Executing MCP action...</p>
        </div>
      )}
    </div>
  );
};

export default EnhancedIndex;