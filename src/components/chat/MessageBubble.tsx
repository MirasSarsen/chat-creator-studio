import { Message } from "@/types/chat";
import { User, Bot, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface MessageBubbleProps {
  message: Message;
  onSpeak?: (text: string) => void;
  isSpeaking?: boolean;
}

export function MessageBubble({ message, onSpeak, isSpeaking }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex gap-3 animate-slide-up ${isUser ? "flex-row-reverse" : ""}`}
    >
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-secondary text-secondary-foreground"
        }`}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      {/* Message Content */}
      <div className={`flex flex-col gap-1 max-w-[75%] ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`message-bubble ${isUser ? "message-user" : "message-assistant"}`}
        >
          <div className="whitespace-pre-wrap text-sm leading-relaxed">
            {message.content}
          </div>
        </div>

        {/* Actions for assistant messages */}
        {!isUser && onSpeak && (
          <div className="flex items-center gap-1 px-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-muted-foreground hover:text-primary"
              onClick={() => onSpeak(message.content)}
              disabled={isSpeaking}
            >
              <Volume2 className={`w-3.5 h-3.5 ${isSpeaking ? "animate-pulse text-primary" : ""}`} />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
