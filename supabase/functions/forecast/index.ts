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
    const { salesData } = await req.json();

    if (!Array.isArray(salesData) || salesData.length < 2) {
      return new Response(
        JSON.stringify({ error: "At least 2 data points required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a time-series forecasting analyst. You will receive monthly sales data as an array of {month, sales} objects. Analyze the trend, seasonality, and patterns to produce accurate demand forecasts for the next 3 periods. Provide confidence intervals (lower and upper bounds) and a brief summary of the trend. Be realistic with predictions — do not hallucinate extreme values.`;

    const userPrompt = `Here is the historical sales data:\n${JSON.stringify(salesData)}\n\nAnalyze this data and produce a forecast for the next 3 periods. Use the forecast_result tool to return your predictions.`;

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
              name: "forecast_result",
              description: "Return the demand forecast predictions with confidence intervals and a summary.",
              parameters: {
                type: "object",
                properties: {
                  predictions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        month: { type: "string", description: "Label for the forecasted period, e.g. 2024-04 or F+1" },
                        predicted: { type: "number", description: "Predicted sales value" },
                        lower_bound: { type: "number", description: "Lower bound of confidence interval" },
                        upper_bound: { type: "number", description: "Upper bound of confidence interval" },
                      },
                      required: ["month", "predicted", "lower_bound", "upper_bound"],
                      additionalProperties: false,
                    },
                  },
                  summary: { type: "string", description: "Brief text insight about the trend and forecast" },
                  confidence_level: { type: "number", description: "Overall confidence percentage (0-100)" },
                },
                required: ["predictions", "summary", "confidence_level"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "forecast_result" } },
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

    if (!toolCall || toolCall.function.name !== "forecast_result") {
      console.error("Unexpected AI response:", JSON.stringify(result));
      return new Response(
        JSON.stringify({ error: "AI did not return a valid forecast" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const forecast = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(forecast), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("forecast error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
