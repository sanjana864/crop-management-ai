import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { latitude, longitude } = await req.json();
    
    console.log(`Fetching weather for lat: ${latitude}, lon: ${longitude}`);

    // Use Open-Meteo API - free, no API key required
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=auto`;
    
    const response = await fetch(weatherUrl);
    
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Weather data received:', JSON.stringify(data));

    const current = data.current;
    
    // Map weather codes to conditions
    // WMO Weather codes: https://open-meteo.com/en/docs
    const weatherCode = current.weather_code;
    let condition: "sunny" | "cloudy" | "rainy" = "sunny";
    
    if (weatherCode >= 0 && weatherCode <= 3) {
      condition = weatherCode <= 1 ? "sunny" : "cloudy";
    } else if (weatherCode >= 45 && weatherCode <= 48) {
      condition = "cloudy"; // Fog
    } else if (weatherCode >= 51 && weatherCode <= 67) {
      condition = "rainy"; // Drizzle and rain
    } else if (weatherCode >= 71 && weatherCode <= 77) {
      condition = "cloudy"; // Snow
    } else if (weatherCode >= 80 && weatherCode <= 99) {
      condition = "rainy"; // Showers and thunderstorms
    }

    // Determine if good for harvest based on conditions
    const isGoodForHarvest = condition === "sunny" && 
                             current.relative_humidity_2m < 75 && 
                             current.wind_speed_10m < 25;

    let recommendation = "";
    if (isGoodForHarvest) {
      recommendation = "Perfect weather for harvesting! Low humidity and clear skies make today ideal for crop collection.";
    } else if (condition === "rainy") {
      recommendation = "Rain expected. Not ideal for harvesting - crops may be too wet. Consider waiting for drier conditions.";
    } else if (current.relative_humidity_2m >= 75) {
      recommendation = "High humidity today. Harvesting may result in moisture-related issues. Wait for lower humidity.";
    } else if (current.wind_speed_10m >= 25) {
      recommendation = "Strong winds today. Be cautious with field work and consider postponing delicate harvesting activities.";
    } else {
      recommendation = "Conditions are moderate. Check specific crop requirements before proceeding with harvest.";
    }

    const weatherData = {
      temperature: Math.round(current.temperature_2m),
      humidity: Math.round(current.relative_humidity_2m),
      windSpeed: Math.round(current.wind_speed_10m),
      feelsLike: Math.round(current.apparent_temperature),
      condition,
      recommendation,
      isGoodForHarvest,
    };

    return new Response(JSON.stringify(weatherData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Error in get-weather function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
