import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Predefined crop-weather suitability rules
const cropRules = [
  {
    name: "Rice",
    minTemp: 20, maxTemp: 38, idealHumidity: [60, 90], bestConditions: ["rainy", "cloudy"],
    season: "Kharif (Jun-Nov)", harvestTime: "120-150 days",
    reason_sunny: "Rice needs plenty of water; sunny weather may require extra irrigation.",
    reason_rainy: "Perfect for rice! Rainy season provides the water-intensive environment rice thrives in.",
    reason_cloudy: "Good for rice cultivation with moderate moisture levels.",
  },
  {
    name: "Wheat",
    minTemp: 10, maxTemp: 30, idealHumidity: [40, 70], bestConditions: ["sunny", "cloudy"],
    season: "Rabi (Nov-Mar)", harvestTime: "100-120 days",
    reason_sunny: "Excellent! Wheat loves cool sunny weather with low humidity.",
    reason_rainy: "Too much rain can cause wheat rust disease. Consider waiting.",
    reason_cloudy: "Good for wheat, moderate conditions support healthy growth.",
  },
  {
    name: "Cotton",
    minTemp: 21, maxTemp: 40, idealHumidity: [40, 65], bestConditions: ["sunny"],
    season: "Kharif (Apr-Oct)", harvestTime: "150-180 days",
    reason_sunny: "Perfect for cotton! It thrives in warm, sunny conditions.",
    reason_rainy: "Excessive rain damages cotton bolls. Monitor closely.",
    reason_cloudy: "Acceptable but cotton prefers more sunshine.",
  },
  {
    name: "Tomato",
    minTemp: 18, maxTemp: 35, idealHumidity: [50, 70], bestConditions: ["sunny", "cloudy"],
    season: "Year-round", harvestTime: "60-90 days",
    reason_sunny: "Great for tomatoes! Warm sunshine produces sweeter fruits.",
    reason_rainy: "Risk of blight disease. Use raised beds and proper drainage.",
    reason_cloudy: "Moderate conditions work well for tomato growth.",
  },
  {
    name: "Sugarcane",
    minTemp: 20, maxTemp: 42, idealHumidity: [60, 85], bestConditions: ["sunny", "rainy"],
    season: "Year-round", harvestTime: "270-365 days",
    reason_sunny: "Sugarcane loves sunshine for sugar accumulation.",
    reason_rainy: "Good! Sugarcane needs plenty of water during growth phase.",
    reason_cloudy: "Adequate for growth but may slow sugar accumulation.",
  },
  {
    name: "Potato",
    minTemp: 12, maxTemp: 28, idealHumidity: [60, 80], bestConditions: ["cloudy"],
    season: "Rabi (Oct-Feb)", harvestTime: "75-120 days",
    reason_sunny: "Too much heat stresses potatoes. Best in cooler weather.",
    reason_rainy: "Moderate rain is fine, but waterlogging causes rot.",
    reason_cloudy: "Ideal for potatoes! Cool, overcast conditions promote tuber growth.",
  },
  {
    name: "Maize",
    minTemp: 18, maxTemp: 38, idealHumidity: [50, 75], bestConditions: ["sunny", "cloudy"],
    season: "Kharif & Rabi", harvestTime: "80-110 days",
    reason_sunny: "Great for maize! Warm conditions support rapid growth.",
    reason_rainy: "Good during early growth, but excessive rain during pollination reduces yield.",
    reason_cloudy: "Acceptable conditions for steady maize growth.",
  },
  {
    name: "Groundnut",
    minTemp: 20, maxTemp: 35, idealHumidity: [40, 65], bestConditions: ["sunny"],
    season: "Kharif (Jun-Oct)", harvestTime: "100-130 days",
    reason_sunny: "Perfect! Groundnut thrives in warm, well-drained conditions.",
    reason_rainy: "Excess moisture causes pod rot. Ensure good drainage.",
    reason_cloudy: "Moderate conditions are acceptable for groundnut.",
  },
];

function getSuitabilityScore(crop: typeof cropRules[0], temp: number, humidity: number, condition: string): number {
  let score = 50;

  // Temperature suitability
  if (temp >= crop.minTemp && temp <= crop.maxTemp) {
    const midTemp = (crop.minTemp + crop.maxTemp) / 2;
    const tempDiff = Math.abs(temp - midTemp);
    const tempRange = (crop.maxTemp - crop.minTemp) / 2;
    score += 20 * (1 - tempDiff / tempRange);
  } else {
    score -= 30;
  }

  // Humidity suitability
  if (humidity >= crop.idealHumidity[0] && humidity <= crop.idealHumidity[1]) {
    score += 15;
  } else {
    score -= 10;
  }

  // Weather condition match
  if (crop.bestConditions.includes(condition)) {
    score += 15;
  } else {
    score -= 5;
  }

  return Math.max(10, Math.min(100, Math.round(score)));
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { temperature, humidity, condition, language } = await req.json();

    // Rule-based suggestions
    const suggestions = cropRules.map(crop => {
      const score = getSuitabilityScore(crop, temperature, humidity, condition);
      const reasonKey = `reason_${condition}` as keyof typeof crop;
      const reason = (crop[reasonKey] as string) || crop.reason_cloudy;

      return {
        name: crop.name,
        reason,
        season: crop.season,
        harvestTime: crop.harvestTime,
        suitabilityScore: score,
      };
    });

    // Sort by score descending
    suggestions.sort((a, b) => b.suitabilityScore - a.suitabilityScore);

    // Try AI enhancement if available
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    let aiEnhanced = false;
    let aiTips = "";

    if (LOVABLE_API_KEY) {
      try {
        const langMap: Record<string, string> = {
          en: "English", ta: "Tamil", hi: "Hindi", te: "Telugu"
        };
        const langName = langMap[language] || "English";
        
        const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: [
              {
                role: "system",
                content: `You are an expert Indian agricultural advisor. Respond in ${langName}. Be concise (3-4 sentences).`
              },
              {
                role: "user",
                content: `Weather: ${temperature}°C, ${humidity}% humidity, ${condition}. Top suggested crops: ${suggestions.slice(0, 3).map(s => s.name).join(", ")}. Give a brief farming tip for today's weather and these crops. Include when to plant and any precautions.`
              }
            ],
          }),
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          aiTips = aiData.choices?.[0]?.message?.content || "";
          aiEnhanced = true;
        }
      } catch (e) {
        console.error("AI enhancement failed, using rules only:", e);
      }
    }

    return new Response(JSON.stringify({
      suggestions: suggestions.slice(0, 5),
      aiTips,
      aiEnhanced,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Error in suggest-crops:', error);
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
