import { Cloud, Sun, CloudRain, Wind, Droplets, Thermometer } from "lucide-react";

interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  condition: "sunny" | "cloudy" | "rainy";
  recommendation: string;
  isGoodForHarvest: boolean;
}

const weatherData: WeatherData = {
  temperature: 28,
  humidity: 65,
  windSpeed: 12,
  condition: "sunny",
  recommendation: "Perfect weather for harvesting! Low humidity and clear skies make today ideal for crop collection.",
  isGoodForHarvest: true,
};

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
  return (
    <div className="feature-card">
      <div className="flex flex-col md:flex-row items-center gap-6">
        <div className="flex flex-col items-center">
          <WeatherIcon condition={weatherData.condition} />
          <span className="text-4xl font-extrabold mt-2">{weatherData.temperature}°C</span>
          <span className="text-muted-foreground capitalize">{weatherData.condition}</span>
        </div>
        
        <div className="flex-1">
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="flex flex-col items-center p-3 bg-muted rounded-xl">
              <Droplets className="w-6 h-6 text-accent mb-1" />
              <span className="text-sm text-muted-foreground">Humidity</span>
              <span className="font-bold">{weatherData.humidity}%</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-muted rounded-xl">
              <Wind className="w-6 h-6 text-accent mb-1" />
              <span className="text-sm text-muted-foreground">Wind</span>
              <span className="font-bold">{weatherData.windSpeed} km/h</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-muted rounded-xl">
              <Thermometer className="w-6 h-6 text-secondary mb-1" />
              <span className="text-sm text-muted-foreground">Feels Like</span>
              <span className="font-bold">{weatherData.temperature + 2}°C</span>
            </div>
          </div>
          
          <div className={`p-4 rounded-xl ${weatherData.isGoodForHarvest ? 'bg-growth-light border-2 border-growth' : 'bg-secondary/20 border-2 border-secondary'}`}>
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-3 h-3 rounded-full ${weatherData.isGoodForHarvest ? 'bg-growth animate-pulse-glow' : 'bg-secondary'}`} />
              <span className="font-bold text-lg">
                {weatherData.isGoodForHarvest ? "✓ Good for Harvest" : "⏳ Wait to Harvest"}
              </span>
            </div>
            <p className="text-muted-foreground">{weatherData.recommendation}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
