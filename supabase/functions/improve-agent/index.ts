import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { agentId, originalPrompt } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Fetch recent feedback for this agent
    const { data: feedbackData, error: feedbackError } = await supabase
      .from("agent_feedback")
      .select("*")
      .eq("agent_id", agentId)
      .order("created_at", { ascending: false })
      .limit(20);

    if (feedbackError) {
      console.error("Error fetching feedback:", feedbackError);
      throw feedbackError;
    }

    // Fetch recent conversation logs
    const { data: logsData, error: logsError } = await supabase
      .from("conversation_logs")
      .select("*")
      .eq("agent_id", agentId)
      .order("created_at", { ascending: false })
      .limit(30);

    if (logsError) {
      console.error("Error fetching logs:", logsError);
      throw logsError;
    }

    // Calculate average rating
    const ratings = feedbackData?.map(f => f.rating) || [];
    const avgRating = ratings.length > 0 
      ? ratings.reduce((a, b) => a + b, 0) / ratings.length 
      : null;

    // Build improvement prompt with feedback context
    const feedbackContext = feedbackData?.map(f => 
      `- Rating: ${f.rating}/5, Feedback: "${f.feedback_text || 'No comment'}", Response: "${f.original_response?.substring(0, 200)}..."`
    ).join("\n") || "No feedback yet";

    const conversationContext = logsData?.slice(0, 10).map(l =>
      `User: "${l.user_message?.substring(0, 100)}..." → Response: "${l.assistant_response?.substring(0, 150)}..." (Rating: ${l.rating || 'unrated'})`
    ).join("\n") || "No conversations yet";

    console.log(`Improving agent ${agentId} with ${feedbackData?.length || 0} feedback items`);

    // Call AI to generate improved prompt
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
            content: `You are an AI prompt engineer. Analyze the current prompt and user feedback to create an improved version. 
            
Focus on:
1. Addressing common complaints or low ratings
2. Improving response quality based on patterns
3. Making instructions clearer and more specific
4. Keeping the core personality and purpose intact

Return ONLY a JSON object with this structure:
{
  "improved_prompt": "the new improved prompt text",
  "improvement_reason": "brief explanation of what was changed and why",
  "confidence": 0.0-1.0
}`
          },
          {
            role: "user",
            content: `CURRENT PROMPT:
${originalPrompt}

AVERAGE RATING: ${avgRating?.toFixed(2) || 'No ratings yet'}

RECENT FEEDBACK:
${feedbackContext}

CONVERSATION SAMPLES:
${conversationContext}

Please analyze this data and provide an improved prompt that addresses the feedback patterns.`
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    // Parse JSON response
    let improvement;
    try {
      // Extract JSON from potential markdown code block
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || 
                       content.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
      improvement = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      improvement = {
        improved_prompt: originalPrompt,
        improvement_reason: "Could not parse improvement suggestions",
        confidence: 0
      };
    }

    // Store the improvement
    const { data: insertData, error: insertError } = await supabase
      .from("agent_improvements")
      .insert({
        agent_id: agentId,
        original_prompt: originalPrompt,
        improved_prompt: improvement.improved_prompt,
        improvement_reason: improvement.improvement_reason,
        avg_rating_before: avgRating,
        feedback_count: feedbackData?.length || 0,
        is_active: false // User needs to activate it
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error storing improvement:", insertError);
      throw insertError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        improvement: insertData,
        stats: {
          avgRating,
          feedbackCount: feedbackData?.length || 0,
          conversationCount: logsData?.length || 0
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error improving agent:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
