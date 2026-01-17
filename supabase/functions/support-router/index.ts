// supabase/functions/support-router/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPPORT_AGENTS = {
  "technical": "tech-support",
  "bug": "tech-support",
  "billing": "billing-support",
  "general": "general-support",
  "feature_request": "general-support",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, title, description, ticketId } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    if (action === "create_ticket") {
      // Use AI to categorize and prioritize
      const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content: `You are a support ticket classifier. Analyze tickets and return ONLY a JSON object with:
{
  "category": "technical" | "billing" | "general" | "feature_request" | "bug",
  "priority": "low" | "medium" | "high" | "urgent",
  "tags": ["tag1", "tag2"],
  "summary": "brief summary"
}`
            },
            {
              role: "user",
              content: `Title: ${title}\nDescription: ${description}`
            }
          ],
        }),
      });

      if (!aiResponse.ok) {
        throw new Error("AI classification failed");
      }

      const aiResult = await aiResponse.json();
      const content = aiResult.choices?.[0]?.message?.content;
      
      let classification;
      try {
        const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || 
                         content.match(/\{[\s\S]*\}/);
        const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
        classification = JSON.parse(jsonStr);
      } catch {
        classification = {
          category: "general",
          priority: "medium",
          tags: [],
          summary: title
        };
      }

      // Assign to appropriate agent
      const assignedAgent = SUPPORT_AGENTS[classification.category] || "general-support";

      // Create ticket in database
      const { data: ticket, error } = await supabase
        .from("support_tickets")
        .insert({
          title,
          description,
          category: classification.category,
          priority: classification.priority,
          status: "open",
          assigned_agent: assignedAgent,
          tags: classification.tags,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      console.log(`Created ticket ${ticket.id}, assigned to ${assignedAgent}`);

      return new Response(
        JSON.stringify({
          success: true,
          ticket: {
            ...ticket,
            assignedAgent,
          }
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "route_ticket") {
      // Re-route ticket based on updated information
      const { data: ticket } = await supabase
        .from("support_tickets")
        .select("*")
        .eq("id", ticketId)
        .single();

      if (!ticket) {
        throw new Error("Ticket not found");
      }

      const assignedAgent = SUPPORT_AGENTS[ticket.category] || "general-support";

      await supabase
        .from("support_tickets")
        .update({ assigned_agent: assignedAgent })
        .eq("id", ticketId);

      return new Response(
        JSON.stringify({
          success: true,
          assignedAgent,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    throw new Error(`Unknown action: ${action}`);
  } catch (error) {
    console.error("Support router error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});