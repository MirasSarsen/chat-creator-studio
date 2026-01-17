import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThumbsUp, ThumbsDown, Star, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface FeedbackButtonsProps {
  messageId: string;
  agentId: string;
  response: string;
  onFeedbackSubmit?: () => void;
}

export function FeedbackButtons({ 
  messageId, 
  agentId, 
  response, 
  onFeedbackSubmit 
}: FeedbackButtonsProps) {
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleQuickFeedback = async (isPositive: boolean) => {
    if (isPositive) {
      // Quick positive feedback
      await submitFeedback(5, "");
    } else {
      // Show detailed rating for negative feedback
      setShowRating(true);
    }
  };

  const submitFeedback = async (finalRating: number, text: string) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("agent_feedback").insert({
        agent_id: agentId,
        message_id: messageId,
        rating: finalRating,
        feedback_text: text || null,
        original_response: response.substring(0, 2000) // Limit size
      });

      if (error) throw error;

      setSubmitted(true);
      setShowRating(false);
      toast.success("Спасибо за отзыв! Это поможет улучшить агента.");
      onFeedbackSubmit?.();
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error("Не удалось отправить отзыв");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-2 text-xs text-muted-foreground"
      >
        <span className="text-green-400">✓ Отзыв сохранён</span>
      </motion.div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <AnimatePresence mode="wait">
        {!showRating ? (
          <motion.div
            key="quick-buttons"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-1"
          >
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 hover:bg-green-500/20 hover:text-green-400"
              onClick={() => handleQuickFeedback(true)}
            >
              <ThumbsUp className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 hover:bg-red-500/20 hover:text-red-400"
              onClick={() => handleQuickFeedback(false)}
            >
              <ThumbsDown className="h-3.5 w-3.5" />
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="rating-form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass-panel p-3 rounded-lg space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Оцените ответ:</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => setShowRating(false)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  className="transition-transform hover:scale-110"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                >
                  <Star
                    className={`h-5 w-5 transition-colors ${
                      star <= (hoverRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground"
                    }`}
                  />
                </button>
              ))}
            </div>

            <Textarea
              placeholder="Что можно улучшить? (опционально)"
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              className="min-h-[60px] text-xs bg-background/50 border-white/10"
            />

            <Button
              size="sm"
              className="w-full h-8 text-xs"
              disabled={rating === 0 || isSubmitting}
              onClick={() => submitFeedback(rating, feedbackText)}
            >
              {isSubmitting ? (
                "Отправка..."
              ) : (
                <>
                  <Send className="h-3 w-3 mr-1" />
                  Отправить
                </>
              )}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
