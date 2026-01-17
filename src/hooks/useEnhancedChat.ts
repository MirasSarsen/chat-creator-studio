// src/hooks/useEnhancedChat.ts
import { useState, useCallback } from "react";
import { useChat } from "@/hooks/useChat";
import { useMCP } from "@/hooks/useMCP";
import { useSupport } from "@/hooks/useSupport";
import { useContextSwitching } from "@/hooks/useContextSwitching";
import { Agent } from "@/types/chat";

export function useEnhancedChat() {
  const chat = useChat();
  const mcp = useMCP();
  const support = useSupport();
  const context = useContextSwitching();
  
  const [autoContextSwitch, setAutoContextSwitch] = useState(true);
  const [autoCreateTickets, setAutoCreateTickets] = useState(false);

  // Enhanced send message with context switching
  const sendEnhancedMessage = useCallback(
    async (content: string) => {
      // Detect intent and potentially switch context
      if (autoContextSwitch) {
        await context.switchContext(
          content,
          chat.selectedAgent,
          chat.setSelectedAgent,
          true
        );
      }

      // Check if this is a support request
      if (autoCreateTickets) {
        const detected = await context.detectIntent(content);
        if (detected.intent === "support" && detected.confidence > 70) {
          await support.createTicket(
            "Support Request",
            content
          );
        }
      }

      // Send the message
      await chat.sendMessage(content);
    },
    [
      autoContextSwitch,
      autoCreateTickets,
      chat,
      context,
      support,
    ]
  );

  return {
    // Chat functions
    ...chat,
    sendMessage: sendEnhancedMessage,
    
    // MCP functions
    mcp,
    
    // Support functions
    support,
    
    // Context switching
    context,
    
    // Settings
    autoContextSwitch,
    setAutoContextSwitch,
    autoCreateTickets,
    setAutoCreateTickets,
  };
}