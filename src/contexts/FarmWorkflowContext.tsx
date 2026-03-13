import { createContext, useContext, useState, ReactNode } from "react";

interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  feelsLike: number;
  condition: "sunny" | "cloudy" | "rainy";
  recommendation: string;
  isGoodForHarvest: boolean;
}

interface CropSuggestion {
  name: string;
  reason: string;
  season: string;
  harvestTime: string;
  suitabilityScore: number;
}

interface FarmWorkflowContextType {
  weatherData: WeatherData | null;
  setWeatherData: (data: WeatherData | null) => void;
  selectedCrop: string;
  setSelectedCrop: (crop: string) => void;
  suggestedCrops: CropSuggestion[];
  setSuggestedCrops: (crops: CropSuggestion[]) => void;
  weatherConditionForML: string;
  temperatureForML: number;
}

const FarmWorkflowContext = createContext<FarmWorkflowContextType | undefined>(undefined);

export const FarmWorkflowProvider = ({ children }: { children: ReactNode }) => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [selectedCrop, setSelectedCrop] = useState<string>("");
  const [suggestedCrops, setSuggestedCrops] = useState<CropSuggestion[]>([]);

  const weatherConditionForML = weatherData
    ? weatherData.condition === "rainy"
      ? "rainy"
      : weatherData.humidity >= 75
      ? "humid"
      : weatherData.condition === "sunny" && weatherData.humidity < 50
      ? "dry"
      : "moderate"
    : "moderate";

  const temperatureForML = weatherData?.temperature ?? 28;

  return (
    <FarmWorkflowContext.Provider
      value={{
        weatherData,
        setWeatherData,
        selectedCrop,
        setSelectedCrop,
        suggestedCrops,
        setSuggestedCrops,
        weatherConditionForML,
        temperatureForML,
      }}
    >
      {children}
    </FarmWorkflowContext.Provider>
  );
};

export const useFarmWorkflow = () => {
  const context = useContext(FarmWorkflowContext);
  if (!context) {
    throw new Error("useFarmWorkflow must be used within a FarmWorkflowProvider");
  }
  return context;
};

export type { WeatherData, CropSuggestion };
