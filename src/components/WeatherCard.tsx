import { useState, useEffect } from "react";
import { Cloud, Sun, CloudRain, Wind, Droplets, Thermometer, Loader2 } from "lucide-react";
import { useWeather } from "@/hooks/useWeather";
import { LocationSelector, LOCATIONS } from "./LocationSelector";
import { useLanguage } from "@/contexts/LanguageContext";
import { useFarmWorkflow } from "@/contexts/FarmWorkflowContext";

const WeatherIcon = ({ condition }: { condition: string }) => {
  switch (condition) {
    case "sunny":
      return <Sun className="w-16 h-16 text-harvest" />;
    case "cloudy":
      return <Cloud className="w-16 h-16 text-muted-foreground" />;
    case "rainy":
      return <CloudRain className="w-16 h-16 text-accent" />;
    default:
      return <Sun className="w-16 h-16 text-harvest" />;
  }
};

export const WeatherCard = () => {
  const [selectedLocationName, setSelectedLocationName] = useState("Current Location");
  const [coords, setCoords] = useState<{ lat?: number; lon?: number; useCurrentLocation: boolean }>({
    useCurrentLocation: true,
  });
  const { t } = useLanguage();

  const { weather, loading, error } = useWeather({
    latitude: coords.lat,
    longitude: coords.lon,
    useCurrentLocation: coords.useCurrentLocation,
  });

  const handleLocationChange = (locationName: string) => {
    setSelectedLocationName(locationName);
    
    if (locationName === "Current Location") {
      setCoords({ useCurrentLocation: true });
    } else {
      const location = LOCATIONS.find((l) => l.name === locationName);
      if (location) {
        setCoords({
          lat: location.lat,
          lon: location.lon,
          useCurrentLocation: false,
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="feature-card">
        <div className="flex justify-between items-center mb-4">
          <LocationSelector
            selectedLocation={selectedLocationName}
            onLocationChange={handleLocationChange}
          />
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">{t('fetchingWeather')}</span>
        </div>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="feature-card">
        <div className="flex justify-between items-center mb-4">
          <LocationSelector
            selectedLocation={selectedLocationName}
            onLocationChange={handleLocationChange}
          />
        </div>
        <div className="text-center py-8 text-muted-foreground">
          <Cloud className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>{t('unableToFetch')}</p>
          <p className="text-sm mt-1">{error || t('tryAgain')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="feature-card">
      <div className="flex justify-between items-center mb-6">
        <LocationSelector
          selectedLocation={selectedLocationName}
          onLocationChange={handleLocationChange}
        />
      </div>
      
      <div className="flex flex-col md:flex-row items-center gap-6">
        <div className="flex flex-col items-center">
          <WeatherIcon condition={weather.condition} />
          <span className="text-4xl font-extrabold mt-2">{weather.temperature}°C</span>
          <span className="text-muted-foreground capitalize">{weather.condition}</span>
        </div>
        
        <div className="flex-1">
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="flex flex-col items-center p-3 bg-muted rounded-xl">
              <Droplets className="w-6 h-6 text-accent mb-1" />
              <span className="text-sm text-muted-foreground">{t('humidity')}</span>
              <span className="font-bold">{weather.humidity}%</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-muted rounded-xl">
              <Wind className="w-6 h-6 text-accent mb-1" />
              <span className="text-sm text-muted-foreground">{t('wind')}</span>
              <span className="font-bold">{weather.windSpeed} km/h</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-muted rounded-xl">
              <Thermometer className="w-6 h-6 text-secondary mb-1" />
              <span className="text-sm text-muted-foreground">{t('feelsLike')}</span>
              <span className="font-bold">{weather.feelsLike}°C</span>
            </div>
          </div>
          
          <div className={`p-4 rounded-xl ${weather.isGoodForHarvest ? 'bg-growth-light border-2 border-growth' : 'bg-secondary/20 border-2 border-secondary'}`}>
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-3 h-3 rounded-full ${weather.isGoodForHarvest ? 'bg-growth animate-pulse-glow' : 'bg-secondary'}`} />
              <span className="font-bold text-lg">
                {weather.isGoodForHarvest ? t('goodForHarvest') : t('waitToHarvest')}
              </span>
            </div>
            <p className="text-muted-foreground">{weather.recommendation}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
