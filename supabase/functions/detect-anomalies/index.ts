import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { categoryData, salesOverTime, kpis } = await req.json();

    if (!Array.isArray(categoryData) || categoryData.length === 0) {
      return new Response(
        JSON.stringify({ error: "No category data provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a data anomaly detection analyst. You will receive sales data broken down by category and over time. Analyze the data using statistical methods (Z-scores, IQR, trend deviations, sudden spikes/drops) to identify genuine anomalies. For each anomaly found, provide a clear explanation of WHY it is anomalous and what business action might be needed. Be selective — only flag truly unusual patterns, not minor variations.`;

    const userPrompt = `Analyze this sales data for anomalies:

Category breakdown: ${JSON.stringify(categoryData)}
${salesOverTime ? `Monthly sales trend: ${JSON.stringify(salesOverTime)}` : ""}
${kpis ? `KPIs: ${JSON.stringify(kpis)}` : ""}

Use the report_anomalies tool to return your findings.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "report_anomalies",
              description: "Return detected anomalies with explanations and severity.",
              parameters: {
                type: "object",
                properties: {
                  anomalies: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string", description: "Short anomaly title, e.g. 'Electronics sales spike'" },
                        severity: { type: "string", enum: ["critical", "warning", "info"], description: "How severe is this anomaly" },
                        explanation: { type: "string", description: "Detailed explanation of why this is anomalous and what statistical method detected it" },
                        metric: { type: "string", description: "The metric or category involved" },
                        deviation_pct: { type: "number", description: "Percentage deviation from expected value" },
                        recommendation: { type: "string", description: "Suggested business action" },
                      },
                      required: ["title", "severity", "explanation", "metric", "deviation_pct", "recommendation"],
                      additionalProperties: false,
                    },
                  },
                  overall_health: { type: "string", enum: ["healthy", "attention_needed", "critical"], description: "Overall data health assessment" },
                  summary: { type: "string", description: "Brief overall summary of the data health" },
                },
                required: ["anomalies", "overall_health", "summary"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "report_anomalies" } },
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits in your Lovable workspace settings." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const text = await response.text();
      console.error("AI gateway error:", status, text);
      return new Response(
        JSON.stringify({ error: "AI gateway error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = await response.json();
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall || toolCall.function.name !== "report_anomalies") {
      console.error("Unexpected AI response:", JSON.stringify(result));
      return new Response(
        JSON.stringify({ error: "AI did not return valid anomaly analysis" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const analysis = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("anomaly detection error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
