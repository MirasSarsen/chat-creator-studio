import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, TrendingUp, Check, X, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Agent } from "@/types/chat";

interface AgentImproverProps {
  agent: Agent;
  onPromptUpdate: (newPrompt: string) => void;
}

interface Improvement {
  id: string;
  original_prompt: string;
  improved_prompt: string;
  improvement_reason: string;
  avg_rating_before: number | null;
  feedback_count: number;
  is_active: boolean;
  created_at: string;
}

interface Stats {
  avgRating: number | null;
  feedbackCount: number;
  conversationCount: number;
}

export function AgentImprover({ agent, onPromptUpdate }: AgentImproverProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [improvements, setImprovements] = useState<Improvement[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [showComparison, setShowComparison] = useState<string | null>(null);

  useEffect(() => {
    loadImprovements();
    loadStats();
  }, [agent.id]);

  const loadImprovements = async () => {
    const { data, error } = await supabase
      .from("agent_improvements")
      .select("*")
      .eq("agent_id", agent.id)
      .order("created_at", { ascending: false })
      .limit(5);

    if (!error && data) {
      setImprovements(data);
    }
  };

  const loadStats = async () => {
    const { data: feedback } = await supabase
      .from("agent_feedback")
      .select("rating")
      .eq("agent_id", agent.id);

    const { data: logs } = await supabase
      .from("conversation_logs")
      .select("id")
      .eq("agent_id", agent.id);

    if (feedback) {
      const ratings = feedback.map(f => f.rating);
      setStats({
        avgRating: ratings.length > 0 
          ? ratings.reduce((a, b) => a + b, 0) / ratings.length 
          : null,
        feedbackCount: feedback.length,
        conversationCount: logs?.length || 0
      });
    }
  };

  const generateImprovement = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("improve-agent", {
        body: {
          agentId: agent.id,
          originalPrompt: agent.prompt
        }
      });

      if (error) throw error;

      toast.success("Улучшение сгенерировано!");
      loadImprovements();
      setStats(data.stats);
    } catch (error) {
      console.error("Error generating improvement:", error);
      toast.error("Не удалось сгенерировать улучшение");
    } finally {
      setIsGenerating(false);
    }
  };

  const activateImprovement = async (improvement: Improvement) => {
    try {
      // Deactivate all other improvements for this agent
      await supabase
        .from("agent_improvements")
        .update({ is_active: false })
        .eq("agent_id", agent.id);

      // Activate this one
      await supabase
        .from("agent_improvements")
        .update({ is_active: true })
        .eq("id", improvement.id);

      onPromptUpdate(improvement.improved_prompt);
      toast.success("Улучшенный промпт активирован!");
      loadImprovements();
    } catch (error) {
      console.error("Error activating improvement:", error);
      toast.error("Не удалось активировать улучшение");
    }
  };

  const revertToOriginal = async () => {
    try {
      await supabase
        .from("agent_improvements")
        .update({ is_active: false })
        .eq("agent_id", agent.id);

      onPromptUpdate(agent.prompt);
      toast.success("Возврат к оригинальному промпту");
      loadImprovements();
    } catch (error) {
      console.error("Error reverting:", error);
    }
  };

  return (
    <div className="glass-panel rounded-lg p-4 space-y-4">
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary animate-pulse-glow" />
          <span className="font-medium text-sm">Самосовершенствование</span>
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="space-y-4 overflow-hidden"
          >
            {/* Stats */}
            {stats && (
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-background/30 rounded-lg p-2">
                  <div className="text-lg font-bold text-primary">
                    {stats.avgRating?.toFixed(1) || "—"}
                  </div>
                  <div className="text-[10px] text-muted-foreground">Ср. оценка</div>
                </div>
                <div className="bg-background/30 rounded-lg p-2">
                  <div className="text-lg font-bold text-primary">
                    {stats.feedbackCount}
                  </div>
                  <div className="text-[10px] text-muted-foreground">Отзывов</div>
                </div>
                <div className="bg-background/30 rounded-lg p-2">
                  <div className="text-lg font-bold text-primary">
                    {stats.conversationCount}
                  </div>
                  <div className="text-[10px] text-muted-foreground">Диалогов</div>
                </div>
              </div>
            )}

            {/* Generate button */}
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={generateImprovement}
              disabled={isGenerating || (stats?.feedbackCount || 0) < 3}
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
                  Анализ фидбека...
                </>
              ) : (
                <>
                  <TrendingUp className="h-3 w-3 mr-2" />
                  Сгенерировать улучшение
                </>
              )}
            </Button>

            {(stats?.feedbackCount || 0) < 3 && (
              <p className="text-[10px] text-muted-foreground text-center">
                Нужно минимум 3 отзыва для генерации улучшений
              </p>
            )}

            {/* Improvements list */}
            {improvements.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground">
                  Предложенные улучшения:
                </div>
                {improvements.map((imp) => (
                  <motion.div
                    key={imp.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-3 rounded-lg border text-xs ${
                      imp.is_active 
                        ? "border-primary bg-primary/10" 
                        : "border-white/10 bg-background/30"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-muted-foreground line-clamp-2">
                          {imp.improvement_reason}
                        </p>
                        <button
                          className="text-primary hover:underline mt-1"
                          onClick={() => setShowComparison(
                            showComparison === imp.id ? null : imp.id
                          )}
                        >
                          {showComparison === imp.id ? "Скрыть" : "Сравнить"}
                        </button>
                      </div>
                      <div className="flex gap-1">
                        {imp.is_active ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-[10px]"
                            onClick={revertToOriginal}
                          >
                            <X className="h-3 w-3 mr-1" />
                            Откат
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-[10px] text-green-400 hover:text-green-300"
                            onClick={() => activateImprovement(imp)}
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Применить
                          </Button>
                        )}
                      </div>
                    </div>

                    <AnimatePresence>
                      {showComparison === imp.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="mt-3 pt-3 border-t border-white/10 space-y-2"
                        >
                          <div>
                            <div className="text-[10px] text-red-400 mb-1">Было:</div>
                            <p className="text-muted-foreground bg-red-500/10 p-2 rounded text-[11px]">
                              {imp.original_prompt}
                            </p>
                          </div>
                          <div>
                            <div className="text-[10px] text-green-400 mb-1">Стало:</div>
                            <p className="text-muted-foreground bg-green-500/10 p-2 rounded text-[11px]">
                              {imp.improved_prompt}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
