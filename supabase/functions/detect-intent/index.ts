// supabase/functions/detect-intent/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const INTENT_MAPPING = {
  coding: "coder",
  writing: "writer",
  analysis: "analyst",
  support: "general",
  creative: "writer",
  technical: "coder",
  conversational: "general",
  research: "analyst",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`Detecting intent for message: "${message.substring(0, 50)}..."`);

    // Use AI to detect user intent
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
            content: `You are an intent classifier. Analyze user messages and classify their intent.

Available intents:
- coding: Programming, debugging, code-related tasks
- writing: Creative writing, articles, emails, documentation
- analysis: Data analysis, statistics, insights, trends
- support: Help, troubleshooting, issues, problems
- creative: Brainstorming, design, creative ideation
- technical: System architecture, infrastructure, deployment
- conversational: General chat, opinions, casual discussion
- research: Information gathering, learning, exploration

Return ONLY a JSON object:
{
  "intent": "detected_intent",
  "confidence": 0.0-100.0,
  "keywords": ["key", "words", "found"],
  "reasoning": "brief explanation"
}`
          },
          {
            role: "user",
            content: message
          }
        ],
      }),
    });

    if (!response.ok) {
      throw new Error("AI intent detection failed");
    }

    const aiResult = await response.json();
    const content = aiResult.choices?.[0]?.message?.content;
    
    let detected;
    try {
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || 
                       content.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
      detected = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("Failed to parse intent:", content);
      detected = {
        intent: "conversational",
        confidence: 50,
        keywords: [],
        reasoning: "Could not parse AI response"
      };
    }

    // Map intent to agent
    const suggestedAgent = INTENT_MAPPING[detected.intent] || "general";

    console.log(`Detected intent: ${detected.intent} (${detected.confidence}%) -> ${suggestedAgent}`);

    return new Response(
      JSON.stringify({
        success: true,
        intent: {
          intent: detected.intent,
          confidence: detected.confidence,
          suggestedAgent,
          keywords: detected.keywords,
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Intent detection error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        intent: {
          intent: "conversational",
          confidence: 50,
          suggestedAgent: "general",
          keywords: [],
        }
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});