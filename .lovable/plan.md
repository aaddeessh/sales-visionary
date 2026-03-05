

## Plan: AI-Powered Demand Forecasting with Lovable AI

### Overview
Replace the simple linear trend extrapolation in `ForecastingPanel` with real AI-powered forecasting using the Lovable AI Gateway (Gemini). The AI will analyze the uploaded CSV time-series data and return structured predictions with confidence intervals.

### Architecture

```text
ForecastingPanel (React)
  → sends aggregated sales-over-time data
  → supabase.functions.invoke("forecast")
  → Edge Function (forecast/index.ts)
      → Lovable AI Gateway (gemini-3-flash-preview)
      → tool_call returns structured JSON
  → ForecastingPanel renders predictions + confidence bands
```

### Implementation Steps

**1. Create Edge Function `supabase/functions/forecast/index.ts`**
- Accept `salesData` (array of `{month, sales}`) in the request body
- Build a system prompt instructing the model to act as a time-series forecasting analyst
- Use **tool calling** to extract structured output with schema:
  - `predictions[]`: `{month, predicted, lower_bound, upper_bound}` (3-6 future periods)
  - `summary`: text insight about the trend
  - `confidence_level`: percentage
- Call `https://ai.gateway.lovable.dev/v1/chat/completions` with `google/gemini-3-flash-preview`
- Parse the tool call response and return JSON
- Handle 429/402 errors gracefully

**2. Update `supabase/config.toml`**
- Add `[functions.forecast]` with `verify_jwt = false`

**3. Refactor `ForecastingPanel.tsx`**
- Add a "Generate AI Forecast" button that triggers the edge function call
- Add loading state while the AI processes
- Display the AI predictions on the chart with:
  - Predicted line (dashed)
  - Confidence interval band using Recharts `Area` component (upper/lower bounds)
- Show the AI summary text and confidence level in the KPI cards
- Replace the `$` signs with `₹` in tooltips and axis labels
- Cache the last forecast result in component state so it persists while navigating tabs

**4. Error Handling**
- Toast on 429 (rate limit) and 402 (credits exhausted)
- Fallback to the existing linear trend if AI call fails
- Show loading skeleton while awaiting response

### Files to Create/Modify
- **Create**: `supabase/functions/forecast/index.ts`
- **Modify**: `supabase/config.toml` (add function entry)
- **Modify**: `src/components/dashboard/ForecastingPanel.tsx` (full refactor)

