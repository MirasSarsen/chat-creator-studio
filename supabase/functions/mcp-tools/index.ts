// supabase/functions/mcp-tools/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MCPAction {
  tool: string;
  action: string;
  parameters: Record<string, any>;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { tool, action, parameters } = await req.json() as MCPAction;
    
    const ZAPIER_MCP_KEY = Deno.env.get("ZAPIER_MCP_KEY");
    if (!ZAPIER_MCP_KEY) {
      throw new Error("ZAPIER_MCP_KEY is not configured");
    }

    console.log(`MCP action: tool=${tool}, action=${action}`);

    let result;

    switch (tool) {
      case "google-drive":
        result = await handleGoogleDriveAction(action, parameters, ZAPIER_MCP_KEY);
        break;
      
      case "google-sheets":
        result = await handleGoogleSheetsAction(action, parameters, ZAPIER_MCP_KEY);
        break;
      
      case "gmail":
        result = await handleGmailAction(action, parameters, ZAPIER_MCP_KEY);
        break;
      
      default:
        throw new Error(`Unknown tool: ${tool}`);
    }

    return new Response(
      JSON.stringify({ success: true, ...result }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("MCP error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function handleGoogleDriveAction(
  action: string,
  parameters: Record<string, any>,
  apiKey: string
) {
  const MCP_ENDPOINT = "https://mcp.zapier.com/api/v1/google-drive";
  
  const response = await fetch(`${MCP_ENDPOINT}/${action}`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(parameters),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google Drive API error: ${errorText}`);
  }

  return await response.json();
}

async function handleGoogleSheetsAction(
  action: string,
  parameters: Record<string, any>,
  apiKey: string
) {
  const MCP_ENDPOINT = "https://mcp.zapier.com/api/v1/google-sheets";
  
  const response = await fetch(`${MCP_ENDPOINT}/${action}`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(parameters),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google Sheets API error: ${errorText}`);
  }

  return await response.json();
}

async function handleGmailAction(
  action: string,
  parameters: Record<string, any>,
  apiKey: string
) {
  const MCP_ENDPOINT = "https://mcp.zapier.com/api/v1/gmail";
  
  const response = await fetch(`${MCP_ENDPOINT}/${action}`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(parameters),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gmail API error: ${errorText}`);
  }

  return await response.json();
}