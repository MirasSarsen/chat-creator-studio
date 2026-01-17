import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, ChevronDown, ChevronUp, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { AVAILABLE_MCP_TOOLS } from "@/types/mcp";

interface MCPToolsSettingsProps {
  enabledTools: Set<string>;
  onToggleTool: (toolId: string) => void;
}

export function MCPToolsSettings({ enabledTools, onToggleTool }: MCPToolsSettingsProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="glass-panel rounded-lg p-4 space-y-4">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <Settings className="h-4 w-4 text-primary" />
          <span className="font-medium text-sm">MCP Tools</span>
          <span className="text-xs text-muted-foreground">
            ({enabledTools.size} active)
          </span>
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
            className="space-y-3 overflow-hidden"
          >
            <p className="text-xs text-muted-foreground">
              Enable tools to allow the AI to access external services
            </p>

            {AVAILABLE_MCP_TOOLS.map((tool) => (
              <div
                key={tool.id}
                className="flex items-start justify-between p-3 rounded-lg bg-background/30 border border-white/5"
              >
                <div className="flex items-start gap-3 flex-1">
                  <span className="text-xl">{tool.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-medium">{tool.name}</h4>
                      {enabledTools.has(tool.id) && (
                        <Check className="h-3 w-3 text-green-400" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {tool.description}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={enabledTools.has(tool.id)}
                  onCheckedChange={() => onToggleTool(tool.id)}
                />
              </div>
            ))}

            {enabledTools.size === 0 && (
              <div className="text-center py-4">
                <p className="text-xs text-muted-foreground">
                  No tools enabled. Enable tools to extend AI capabilities.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}