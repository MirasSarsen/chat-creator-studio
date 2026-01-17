// src/hooks/useContextSwitching.ts
import { useState, useCallback, useEffect } from "react";
import { Agent, DEFAULT_AGENTS } from "@/types/chat";
import { UserIntent, DetectedIntent, ContextSwitch, INTENT_PATTERNS } from "@/types/context";
import { useToast } from "@/hooks/use-toast";

const CONTEXT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/detect-intent`;

export function useContextSwitching() {
  const [contextHistory, setContextHistory] = useState<ContextSwitch[]>([]);
  const [currentIntent, setCurrentIntent] = useState<UserIntent>("conversational");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  // Detect intent from user message using AI
  const detectIntent = useCallback(async (message: string): Promise<DetectedIntent> => {
    setIsAnalyzing(true);
    try {
      const response = await fetch(CONTEXT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error("Failed to detect intent");
      }

      const result = await response.json();
      return result.intent;
    } catch (error) {
      console.error("Intent detection error:", error);
      // Fallback to simple keyword matching
      return detectIntentLocally(message);
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  // Local fallback intent detection
  const detectIntentLocally = useCallback((message: string): DetectedIntent => {
    const lowerMessage = message.toLowerCase();
    let maxScore = 0;
    let detectedIntent: UserIntent = "conversational";
    let matchedKeywords: string[] = [];

    for (const [intent, config] of Object.entries(INTENT_PATTERNS)) {
      const matches = config.keywords.filter(keyword => 
        lowerMessage.includes(keyword.toLowerCase())
      );
      
      const score = matches.length / config.keywords.length;
      
      if (score > maxScore) {
        maxScore = score;
        detectedIntent = intent as UserIntent;
        matchedKeywords = matches;
      }
    }

    const confidence = Math.min(maxScore * 100, 95);

    return {
      intent: detectedIntent,
      confidence,
      suggestedAgent: INTENT_PATTERNS[detectedIntent].agentId,
      keywords: matchedKeywords,
    };
  }, []);

  // Switch context based on detected intent
  const switchContext = useCallback(
    (
      message: string,
      currentAgent: Agent,
      onAgentChange: (agent: Agent) => void,
      autoSwitch: boolean = true
    ): Promise<boolean> => {
      return new Promise(async (resolve) => {
        const detected = await detectIntent(message);
        
        // Update current intent
        setCurrentIntent(detected.intent);

        // Check if we should switch
        const suggestedAgent = DEFAULT_AGENTS.find(a => a.id === detected.suggestedAgent);
        
        if (!suggestedAgent || currentAgent.id === suggestedAgent.id) {
          resolve(false);
          return;
        }

        // Only switch if confidence is high enough
        if (detected.confidence < 60) {
          resolve(false);
          return;
        }

        // Record context switch
        const contextSwitch: ContextSwitch = {
          previousAgent: currentAgent.id,
          newAgent: suggestedAgent.id,
          previousIntent: currentIntent,
          newIntent: detected.intent,
          confidence: detected.confidence,
          reason: `Detected ${detected.intent} intent with ${detected.confidence.toFixed(0)}% confidence`,
          timestamp: new Date(),
        };

        setContextHistory(prev => [contextSwitch, ...prev.slice(0, 9)]);

        if (autoSwitch) {
          onAgentChange(suggestedAgent);
          
          toast({
            title: "Context Switched",
            description: `Switched to ${suggestedAgent.name} (${detected.confidence.toFixed(0)}% confidence)`,
            duration: 3000,
          });
          
          resolve(true);
        } else {
          // Show suggestion instead
          toast({
            title: "Agent Suggestion",
            description: `${suggestedAgent.name} might be better for this task`,
            action: {
              label: "Switch",
              onClick: () => onAgentChange(suggestedAgent),
            },
            duration: 5000,
          });
          
          resolve(false);
        }
      });
    },
    [currentIntent, detectIntent, toast]
  );

  return {
    contextHistory,
    currentIntent,
    isAnalyzing,
    detectIntent,
    switchContext,
  };
}