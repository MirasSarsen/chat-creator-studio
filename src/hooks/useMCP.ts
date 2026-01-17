import { useState, useCallback } from "react";
import { MCPTool, MCPAction, GoogleDriveFile } from "@/types/mcp";
import { useToast } from "@/hooks/use-toast";

const MCP_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mcp-tools`;

export function useMCP() {
  const [enabledTools, setEnabledTools] = useState<Set<string>>(new Set());
  const [isExecuting, setIsExecuting] = useState(false);
  const { toast } = useToast();

  const toggleTool = useCallback((toolId: string) => {
    setEnabledTools((prev) => {
      const next = new Set(prev);
      if (next.has(toolId)) {
        next.delete(toolId);
      } else {
        next.add(toolId);
      }
      return next;
    });
  }, []);

  const executeMCPAction = useCallback(
    async (action: MCPAction): Promise<any> => {
      if (!enabledTools.has(action.tool)) {
        throw new Error(`Tool ${action.tool} is not enabled`);
      }

      setIsExecuting(true);
      try {
        const response = await fetch(MCP_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify(action),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "MCP action failed");
        }

        const result = await response.json();
        return result;
      } catch (error) {
        console.error("MCP action error:", error);
        toast({
          variant: "destructive",
          title: "MCP Error",
          description: error instanceof Error ? error.message : "Action failed",
        });
        throw error;
      } finally {
        setIsExecuting(false);
      }
    },
    [enabledTools, toast]
  );

  // Google Drive specific actions
  const listDriveFiles = useCallback(
    async (query?: string): Promise<GoogleDriveFile[]> => {
      const result = await executeMCPAction({
        tool: "google-drive",
        action: "list_files",
        parameters: { query },
      });
      return result.files || [];
    },
    [executeMCPAction]
  );

  const getDriveFile = useCallback(
    async (fileId: string): Promise<GoogleDriveFile> => {
      const result = await executeMCPAction({
        tool: "google-drive",
        action: "get_file",
        parameters: { fileId },
      });
      return result.file;
    },
    [executeMCPAction]
  );

  const searchDriveFiles = useCallback(
    async (searchTerm: string): Promise<GoogleDriveFile[]> => {
      const result = await executeMCPAction({
        tool: "google-drive",
        action: "search_files",
        parameters: { searchTerm },
      });
      return result.files || [];
    },
    [executeMCPAction]
  );

  // Google Sheets specific actions
  const addSheetRow = useCallback(
    async (spreadsheetId: string, values: any[]): Promise<void> => {
      await executeMCPAction({
        tool: "google-sheets",
        action: "add_row",
        parameters: { spreadsheetId, values },
      });
    },
    [executeMCPAction]
  );

  return {
    enabledTools,
    toggleTool,
    isExecuting,
    executeMCPAction,
    // Google Drive
    listDriveFiles,
    getDriveFile,
    searchDriveFiles,
    // Google Sheets
    addSheetRow,
  };
}