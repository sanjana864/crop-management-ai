import { useState, useEffect } from "react";
import { Sprout, Star, Clock, CalendarDays, Loader2, Sparkles, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useFarmWorkflow } from "@/contexts/FarmWorkflowContext";
import { useLanguage } from "@/contexts/LanguageContext";

export const CropSuggestions = () => {
  const { weatherData, selectedCrop, setSelectedCrop, suggestedCrops, setSuggestedCrops } = useFarmWorkflow();
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [aiTips, setAiTips] = useState("");
  const [aiEnhanced, setAiEnhanced] = useState(false);

  useEffect(() => {
    if (weatherData) {
      fetchSuggestions();
    }
  }, [weatherData, language]);

  const fetchSuggestions = async () => {
    if (!weatherData) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('suggest-crops', {
        body: {
          temperature: weatherData.temperature,
          humidity: weatherData.humidity,
          condition: weatherData.condition,
          language,
        },
      });

      if (error) throw error;

      setSuggestedCrops(data.suggestions || []);
      setAiTips(data.aiTips || "");
      setAiEnhanced(data.aiEnhanced || false);
    } catch (err) {
      console.error("Failed to fetch crop suggestions:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!weatherData) {
    return (
      <div className="text-center py-12">
        <Sprout className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
        <p className="text-muted-foreground text-lg">{t('checkWeatherFirst')}</p>
        <p className="text-muted-foreground text-sm mt-1">{t('checkWeatherFirstDesc')}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">{t('analyzingWeatherForCrops')}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Weather Summary Badge */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Badge variant="outline" className="text-sm px-3 py-1">
          🌡️ {weatherData.temperature}°C
        </Badge>
        <Badge variant="outline" className="text-sm px-3 py-1">
          💧 {weatherData.humidity}%
        </Badge>
        <Badge variant="outline" className="text-sm px-3 py-1">
          {weatherData.condition === "sunny" ? "☀️" : weatherData.condition === "rainy" ? "🌧️" : "☁️"} {weatherData.condition}
        </Badge>
      </div>

      {/* AI Tips */}
      {aiTips && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-start gap-2">
              <Sparkles className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-primary mb-1">
                  {aiEnhanced ? t('aiEnhancedTip') : t('farmingTip')}
                </p>
                <p className="text-sm text-foreground/80">{aiTips}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Crop Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {suggestedCrops.map((crop, index) => (
          <Card
            key={crop.name}
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedCrop === crop.name
                ? "ring-2 ring-primary border-primary bg-primary/5"
                : "hover:border-primary/50"
            }`}
            onClick={() => setSelectedCrop(crop.name)}
          >
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {index === 0 && <Star className="w-4 h-4 text-harvest fill-harvest" />}
                  <h4 className="font-bold text-lg">{crop.name}</h4>
                </div>
                {selectedCrop === crop.name && (
                  <CheckCircle className="w-5 h-5 text-primary" />
                )}
              </div>

              <div className="mb-3">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-muted-foreground">{t('suitability')}</span>
                  <span className="font-semibold text-primary">{crop.suitabilityScore}%</span>
                </div>
                <Progress value={crop.suitabilityScore} className="h-2" />
              </div>

              <p className="text-sm text-muted-foreground mb-3">{crop.reason}</p>

              <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <CalendarDays className="w-3 h-3" />
                  <span>{t('season')}: {crop.season}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{t('harvestIn')}: {crop.harvestTime}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedCrop && (
        <div className="text-center">
          <p className="text-primary font-semibold mb-2">
            ✅ {t('selectedCrop')}: {selectedCrop}
          </p>
          <a href="#ml-predictor" className="text-sm text-primary hover:underline">
            {t('nextGetFertilizer')} →
          </a>
        </div>
      )}
    </div>
  );
};
