import { ChevronDown, Sparkles, Zap } from "lucide-react";
import { AVAILABLE_MODELS, Model } from "@/types/chat";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface ModelSelectorProps {
  selectedModel: string;
  onSelectModel: (modelId: string) => void;
}

export function ModelSelector({ selectedModel, onSelectModel }: ModelSelectorProps) {
  const currentModel = AVAILABLE_MODELS.find((m) => m.id === selectedModel) || AVAILABLE_MODELS[0];

  const getProviderIcon = (provider: Model["provider"]) => {
    return provider === "google" ? (
      <Sparkles className="w-3.5 h-3.5 text-primary" />
    ) : (
      <Zap className="w-3.5 h-3.5 text-green-400" />
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-8 gap-2 px-3 text-sm font-medium text-muted-foreground hover:text-foreground bg-muted/50 hover:bg-muted"
        >
          {getProviderIcon(currentModel.provider)}
          <span>{currentModel.name}</span>
          <ChevronDown className="w-3.5 h-3.5 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {AVAILABLE_MODELS.map((model) => (
          <DropdownMenuItem
            key={model.id}
            onClick={() => onSelectModel(model.id)}
            className={`flex items-center gap-3 py-2.5 ${
              model.id === selectedModel ? "bg-primary/10" : ""
            }`}
          >
            {getProviderIcon(model.provider)}
            <div className="flex-1">
              <p className="font-medium text-sm">{model.name}</p>
              <p className="text-xs text-muted-foreground">{model.description}</p>
            </div>
            {model.id === selectedModel && (
              <div className="w-2 h-2 rounded-full bg-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
