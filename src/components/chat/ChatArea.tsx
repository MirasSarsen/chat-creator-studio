import { useRef, useEffect } from "react";
import { Message, Agent } from "@/types/chat";
import { MessageBubble } from "./MessageBubble";
import { ChatInput } from "./ChatInput";
import { ModelSelector } from "./ModelSelector";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Loader2 } from "lucide-react";

interface ChatAreaProps {
  messages: Message[];
  isLoading: boolean;
  selectedModel: string;
  selectedAgent: Agent;
  onSendMessage: (content: string) => void;
  onSelectModel: (modelId: string) => void;
  onSpeak?: (text: string) => void;
  isSpeaking?: boolean;
}

export function ChatArea({
  messages,
  isLoading,
  selectedModel,
  selectedAgent,
  onSendMessage,
  onSelectModel,
  onSpeak,
  isSpeaking,
}: ChatAreaProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border glass-panel">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{selectedAgent.icon}</span>
          <div>
            <h2 className="font-semibold text-sm">{selectedAgent.name}</h2>
            <p className="text-xs text-muted-foreground">{selectedAgent.description}</p>
          </div>
        </div>
        <ModelSelector selectedModel={selectedModel} onSelectModel={onSelectModel} />
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollRef} className="flex-1 p-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <Bot className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Start a conversation</h3>
            <p className="text-muted-foreground text-sm max-w-md">
              I'm {selectedAgent.name}. {selectedAgent.description}. How can I help you today?
            </p>
          </div>
        ) : (
          <div className="space-y-4 max-w-3xl mx-auto">
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                onSpeak={message.role === "assistant" ? onSpeak : undefined}
                isSpeaking={isSpeaking}
              />
            ))}
            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <div className="flex items-center gap-2 text-muted-foreground animate-fade-in">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Thinking...</span>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <ChatInput
        onSend={onSendMessage}
        isLoading={isLoading}
        placeholder={`Message ${selectedAgent.name}...`}
      />
    </div>
  );
}
