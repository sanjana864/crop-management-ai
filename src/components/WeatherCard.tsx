import { Cloud, Sun, CloudRain, Wind, Droplets, Thermometer, Loader2 } from "lucide-react";
import { useWeather } from "@/hooks/useWeather";

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
  const { weather, loading, error } = useWeather();

  if (loading) {
    return (
      <div className="feature-card flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Fetching weather data...</span>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="feature-card">
        <div className="text-center py-8 text-muted-foreground">
          <Cloud className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Unable to fetch weather data</p>
          <p className="text-sm mt-1">{error || "Please try again later"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="feature-card">
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
              <span className="text-sm text-muted-foreground">Humidity</span>
              <span className="font-bold">{weather.humidity}%</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-muted rounded-xl">
              <Wind className="w-6 h-6 text-accent mb-1" />
              <span className="text-sm text-muted-foreground">Wind</span>
              <span className="font-bold">{weather.windSpeed} km/h</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-muted rounded-xl">
              <Thermometer className="w-6 h-6 text-secondary mb-1" />
              <span className="text-sm text-muted-foreground">Feels Like</span>
              <span className="font-bold">{weather.feelsLike}°C</span>
            </div>
          </div>
          
          <div className={`p-4 rounded-xl ${weather.isGoodForHarvest ? 'bg-growth-light border-2 border-growth' : 'bg-secondary/20 border-2 border-secondary'}`}>
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-3 h-3 rounded-full ${weather.isGoodForHarvest ? 'bg-growth animate-pulse-glow' : 'bg-secondary'}`} />
              <span className="font-bold text-lg">
                {weather.isGoodForHarvest ? "✓ Good for Harvest" : "⏳ Wait to Harvest"}
              </span>
            </div>
            <p className="text-muted-foreground">{weather.recommendation}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
