import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { crop, language, weather, soilType, question } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const languageInstructions: Record<string, string> = {
      en: "Respond in English.",
      ta: "Respond in Tamil (தமிழ்). Use Tamil script.",
      hi: "Respond in Hindi (हिंदी). Use Devanagari script.",
      te: "Respond in Telugu (తెలుగు). Use Telugu script."
    };

    const systemPrompt = `You are an expert agricultural advisor specializing in fertilizer recommendations for Indian farming conditions. 
You have deep knowledge of:
- NPK ratios and micronutrient requirements for various crops
- Seasonal fertilizer application schedules
- Soil-specific fertilizer recommendations
- Organic and chemical fertilizer options
- Government schemes and subsidies for fertilizers in India
- Best practices from ICAR (Indian Council of Agricultural Research)

Provide practical, actionable advice that farmers can implement immediately.
Keep responses concise (under 200 words) but comprehensive.
${languageInstructions[language] || languageInstructions.en}`;

    const userPrompt = `
Crop: ${crop || "General farming"}
${weather ? `Current Weather: Temperature ${weather.temperature}°C, Humidity ${weather.humidity}%, Conditions: ${weather.condition}` : ""}
${soilType ? `Soil Type: ${soilType}` : ""}
${question ? `Farmer's Question: ${question}` : "Provide general fertilizer recommendations for this crop."}

Please provide specific, practical fertilizer advice considering the current conditions.`;

    console.log("Sending request to AI gateway for crop:", crop);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Too many requests. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI service limit reached. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || "Unable to generate recommendation.";

    console.log("AI response generated successfully");

    return new Response(
      JSON.stringify({ recommendation: aiResponse }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in fertilizer-ai function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "An error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
