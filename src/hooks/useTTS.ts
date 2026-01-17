import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

const TTS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/text-to-speech`;

export function useTTS() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { toast } = useToast();

  const speak = useCallback(async (text: string) => {
    if (isSpeaking) return;

    setIsSpeaking(true);

    try {
      const response = await fetch(TTS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "TTS request failed");
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };

      audio.onerror = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();
    } catch (error) {
      console.error("TTS error:", error);
      setIsSpeaking(false);
      toast({
        variant: "destructive",
        title: "Voice Error",
        description: "Could not play audio. Please try again.",
      });
    }
  }, [isSpeaking, toast]);

  return { speak, isSpeaking };
}
