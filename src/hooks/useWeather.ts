import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  feelsLike: number;
  condition: "sunny" | "cloudy" | "rainy";
  recommendation: string;
  isGoodForHarvest: boolean;
}

export const useWeather = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);

  useEffect(() => {
    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        (err) => {
          console.error("Geolocation error:", err);
          // Default to a location (e.g., New Delhi, India for farming context)
          setLocation({ lat: 28.6139, lon: 77.209 });
        }
      );
    } else {
      // Default location if geolocation not supported
      setLocation({ lat: 28.6139, lon: 77.209 });
    }
  }, []);

  useEffect(() => {
    if (!location) return;

    const fetchWeather = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fnError } = await supabase.functions.invoke('get-weather', {
          body: { latitude: location.lat, longitude: location.lon },
        });

        if (fnError) {
          throw new Error(fnError.message);
        }

        if (data.error) {
          throw new Error(data.error);
        }

        setWeather(data);
      } catch (err) {
        console.error("Error fetching weather:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch weather");
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [location]);

  return { weather, loading, error, location };
};
