import { useState, useEffect, useCallback } from "react";
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

interface UseWeatherOptions {
  latitude?: number;
  longitude?: number;
  useCurrentLocation?: boolean;
}

export const useWeather = (options: UseWeatherOptions = { useCurrentLocation: true }) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lon: number } | null>(null);

  // Get current location on mount
  useEffect(() => {
    if (options.useCurrentLocation && !options.latitude && !options.longitude) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setCurrentCoords({
              lat: position.coords.latitude,
              lon: position.coords.longitude,
            });
          },
          (err) => {
            console.error("Geolocation error:", err);
            // Default to Delhi
            setCurrentCoords({ lat: 28.6139, lon: 77.209 });
          }
        );
      } else {
        setCurrentCoords({ lat: 28.6139, lon: 77.209 });
      }
    }
  }, [options.useCurrentLocation, options.latitude, options.longitude]);

  const fetchWeather = useCallback(async (lat: number, lon: number) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fnError } = await supabase.functions.invoke('get-weather', {
        body: { latitude: lat, longitude: lon },
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
  }, []);

  useEffect(() => {
    // Use provided coordinates or current location
    const lat = options.latitude ?? currentCoords?.lat;
    const lon = options.longitude ?? currentCoords?.lon;

    if (lat !== undefined && lon !== undefined && lat !== 0 && lon !== 0) {
      fetchWeather(lat, lon);
    } else if (options.useCurrentLocation && currentCoords) {
      fetchWeather(currentCoords.lat, currentCoords.lon);
    }
  }, [options.latitude, options.longitude, currentCoords, options.useCurrentLocation, fetchWeather]);

  return { 
    weather, 
    loading, 
    error, 
    currentCoords,
    refetch: fetchWeather 
  };
};
