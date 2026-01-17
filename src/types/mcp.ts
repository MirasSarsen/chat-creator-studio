export interface MCPTool {
  id: string;
  name: string;
  description: string;
  icon: string;
  enabled: boolean;
  config?: Record<string, any>;
}

export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime: string;
  webViewLink?: string;
  thumbnailLink?: string;
}

export interface MCPAction {
  tool: string;
  action: string;
  parameters: Record<string, any>;
}

export const AVAILABLE_MCP_TOOLS: MCPTool[] = [
  {
    id: "google-drive",
    name: "Google Drive",
    description: "Read and modify files in Google Drive",
    icon: "📁",
    enabled: false,
  },
  {
    id: "google-sheets",
    name: "Google Sheets",
    description: "Add rows and modify spreadsheets",
    icon: "📊",
    enabled: false,
  },
  {
    id: "gmail",
    name: "Gmail",
    description: "Send and read emails",
    icon: "📧",
    enabled: false,
  },
];

// Available Google Drive actions
export const DRIVE_ACTIONS = {
  LIST_FILES: "list_files",
  GET_FILE: "get_file",
  CREATE_FILE: "create_file",
  UPDATE_FILE: "update_file",
  DELETE_FILE: "delete_file",
  SEARCH_FILES: "search_files",
} as const;

// Available Google Sheets actions
export const SHEETS_ACTIONS = {
  ADD_ROW: "add_row",
  GET_SHEET: "get_sheet",
  UPDATE_CELL: "update_cell",
  CREATE_SHEET: "create_sheet",
} as const;