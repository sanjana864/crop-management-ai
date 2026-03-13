import { useState, useEffect } from "react";
import { Brain, Leaf, Droplets, ThermometerSun, CloudRain, FlaskConical, AlertTriangle, CheckCircle, TrendingUp, Server } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

type SoilType = 'clay' | 'sandy' | 'loamy' | 'black' | 'red' | 'alluvial';
type GrowthStage = 'seedling' | 'vegetative' | 'flowering' | 'fruiting' | 'maturity';
type WeatherCondition = 'dry' | 'moderate' | 'rainy' | 'humid';

interface MLInput {
  crop: string;
  soilType: SoilType;
  growthStage: GrowthStage;
  weather: WeatherCondition;
  temperature: number;
  rainfall: number;
  areaAcres: number;
}

interface MLPrediction {
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  confidence: number;
  applicationMethod: string;
  timing: string;
  warnings: string[];
}

interface FertilizerProduct {
  name: string;
  npkContent: string;
  quantity: string;
}

const crops = ['Rice', 'Wheat', 'Cotton', 'Tomato', 'Sugarcane', 'Potato', 'Maize', 'Groundnut'];

const soilTypeLabels: Record<string, Record<SoilType, string>> = {
  en: { clay: 'Clay Soil', sandy: 'Sandy Soil', loamy: 'Loamy Soil', black: 'Black Soil', red: 'Red Soil', alluvial: 'Alluvial Soil' },
  ta: { clay: 'களிமண்', sandy: 'மணல் மண்', loamy: 'களிமணல் மண்', black: 'கருப்பு மண்', red: 'சிவப்பு மண்', alluvial: 'வண்டல் மண்' },
  hi: { clay: 'चिकनी मिट्टी', sandy: 'रेतीली मिट्टी', loamy: 'दोमट मिट्टी', black: 'काली मिट्टी', red: 'लाल मिट्टी', alluvial: 'जलोढ़ मिट्टी' },
  te: { clay: 'బంక మట్టి', sandy: 'ఇసుక నేల', loamy: 'గోరు మట్టి', black: 'నల్ల మట్టి', red: 'ఎర్ర మట్టి', alluvial: 'ఒండ్రు మట్టి' },
};

const growthStageLabels: Record<string, Record<GrowthStage, string>> = {
  en: { seedling: 'Seedling Stage', vegetative: 'Vegetative Growth', flowering: 'Flowering Stage', fruiting: 'Fruiting Stage', maturity: 'Maturity Stage' },
  ta: { seedling: 'நாற்று நிலை', vegetative: 'வளர்ச்சி நிலை', flowering: 'பூக்கும் நிலை', fruiting: 'காய்க்கும் நிலை', maturity: 'முதிர்ச்சி நிலை' },
  hi: { seedling: 'अंकुर अवस्था', vegetative: 'वानस्पतिक वृद्धि', flowering: 'फूल अवस्था', fruiting: 'फल अवस्था', maturity: 'परिपक्वता अवस्था' },
  te: { seedling: 'మొలక దశ', vegetative: 'శాఖీయ ఎదుగుదల', flowering: 'పుష్పించే దశ', fruiting: 'ఫలాల దశ', maturity: 'పరిపక్వ దశ' },
};

const weatherLabels: Record<string, Record<WeatherCondition, string>> = {
  en: { dry: 'Dry', moderate: 'Moderate', rainy: 'Rainy', humid: 'Humid' },
  ta: { dry: 'வறண்ட', moderate: 'மிதமான', rainy: 'மழை', humid: 'ஈரப்பதமான' },
  hi: { dry: 'शुष्क', moderate: 'मध्यम', rainy: 'बारिश', humid: 'नम' },
  te: { dry: 'పొడి', moderate: 'మితమైన', rainy: 'వర్షం', humid: 'తేమ' },
};

const soilTypes: SoilType[] = ['clay', 'sandy', 'loamy', 'black', 'red', 'alluvial'];
const growthStages: GrowthStage[] = ['seedling', 'vegetative', 'flowering', 'fruiting', 'maturity'];
const weatherConditions: WeatherCondition[] = ['dry', 'moderate', 'rainy', 'humid'];

export const MLFertilizerPredictor = () => {
  const [input, setInput] = useState<Partial<MLInput>>({
    crop: '',
    soilType: 'loamy',
    growthStage: 'vegetative',
    weather: 'moderate',
    temperature: 28,
    rainfall: 50,
    areaAcres: 1,
  });
  const [prediction, setPrediction] = useState<MLPrediction | null>(null);
  const [products, setProducts] = useState<FertilizerProduct[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const { t, language } = useLanguage();

  const handlePredict = async () => {
    if (!input.crop) {
      toast.error(t('selectCropError'));
      return;
    }

    setIsCalculating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('ml-fertilizer', {
        body: input as MLInput
      });

      if (error) {
        throw error;
      }

      setPrediction(data.prediction);
      setProducts(data.products);

      await supabase.from('fertilizer_queries').insert({
        crop_name: input.crop,
        soil_type: input.soilType,
        question: `ML Prediction: ${input.growthStage} stage, ${input.weather} weather, ${input.temperature}°C`,
        ai_response: JSON.stringify(data.prediction),
        language: language
      });

      toast.success(t('predictionComplete'));
    } catch (error) {
      console.error('ML prediction error:', error);
      toast.error(t('predictionFailed'));
    } finally {
      setIsCalculating(false);
    }
  };

  const currentSoilLabels = soilTypeLabels[language] || soilTypeLabels.en;
  const currentGrowthLabels = growthStageLabels[language] || growthStageLabels.en;
  const currentWeatherLabels = weatherLabels[language] || weatherLabels.en;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-4">
          <Brain className="w-5 h-5 text-primary" />
          <span className="font-medium text-primary">{t('mlPowered')}</span>
          <Server className="w-4 h-4 text-muted-foreground" />
        </div>
        <h3 className="text-2xl font-bold mb-2">{t('fertilizerPredictor')}</h3>
        <p className="text-muted-foreground">
          {t('serverSideAlgo')}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FlaskConical className="w-5 h-5" />
            {t('inputParameters')}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Leaf className="w-4 h-4 text-growth" />
              {t('cropType')}
            </Label>
            <Select value={input.crop} onValueChange={(v) => setInput({ ...input, crop: v })}>
              <SelectTrigger>
                <SelectValue placeholder={t('selectCrop')} />
              </SelectTrigger>
              <SelectContent>
                {crops.map((crop) => (
                  <SelectItem key={crop} value={crop}>{crop}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Droplets className="w-4 h-4 text-earth" />
              {t('soilType')}
            </Label>
            <Select value={input.soilType} onValueChange={(v) => setInput({ ...input, soilType: v as SoilType })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {soilTypes.map((soil) => (
                  <SelectItem key={soil} value={soil}>{currentSoilLabels[soil]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              {t('growthStage')}
            </Label>
            <Select value={input.growthStage} onValueChange={(v) => setInput({ ...input, growthStage: v as GrowthStage })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {growthStages.map((stage) => (
                  <SelectItem key={stage} value={stage}>{currentGrowthLabels[stage]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <CloudRain className="w-4 h-4 text-sky" />
              {t('weatherCondition')}
            </Label>
            <Select value={input.weather} onValueChange={(v) => setInput({ ...input, weather: v as WeatherCondition })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {weatherConditions.map((w) => (
                  <SelectItem key={w} value={w}>{currentWeatherLabels[w]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <ThermometerSun className="w-4 h-4 text-harvest" />
              {t('temperature')}
            </Label>
            <Input
              type="number"
              value={input.temperature}
              onChange={(e) => setInput({ ...input, temperature: Number(e.target.value) })}
              min={0}
              max={50}
            />
          </div>

          <div className="space-y-2">
            <Label>{t('farmArea')}</Label>
            <Input
              type="number"
              value={input.areaAcres}
              onChange={(e) => setInput({ ...input, areaAcres: Number(e.target.value) })}
              min={0.1}
              step={0.1}
            />
          </div>
        </CardContent>
      </Card>

      <Button onClick={handlePredict} disabled={isCalculating} className="w-full" size="lg">
        {isCalculating ? (
          <>
            <Brain className="w-5 h-5 mr-2 animate-pulse" />
            {t('runningML')}
          </>
        ) : (
          <>
            <Brain className="w-5 h-5 mr-2" />
            {t('predictFertilizer')}
          </>
        )}
      </Button>

      {prediction && (
        <div className="space-y-4 animate-slide-up">
          <Card className="border-primary/30">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{t('predictionConfidence')}</span>
                <span className="text-2xl font-bold text-primary">{prediction.confidence}%</span>
              </div>
              <Progress value={prediction.confidence} className="h-3" />
              <p className="text-sm text-muted-foreground mt-2">
                {t('basedOnDecision')}
              </p>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-3 gap-4">
            <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200">
              <CardContent className="pt-6 text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">{prediction.nitrogen}</div>
                <div className="text-sm text-blue-700 font-medium">{t('kgNitrogen')}</div>
                <div className="text-xs text-muted-foreground mt-1">{t('forLeafGrowth')}</div>
              </CardContent>
            </Card>
            <Card className="bg-orange-50 dark:bg-orange-950/30 border-orange-200">
              <CardContent className="pt-6 text-center">
                <div className="text-4xl font-bold text-orange-600 mb-2">{prediction.phosphorus}</div>
                <div className="text-sm text-orange-700 font-medium">{t('kgPhosphorus')}</div>
                <div className="text-xs text-muted-foreground mt-1">{t('forRootDev')}</div>
              </CardContent>
            </Card>
            <Card className="bg-purple-50 dark:bg-purple-950/30 border-purple-200">
              <CardContent className="pt-6 text-center">
                <div className="text-4xl font-bold text-purple-600 mb-2">{prediction.potassium}</div>
                <div className="text-sm text-purple-700 font-medium">{t('kgPotassium')}</div>
                <div className="text-xs text-muted-foreground mt-1">{t('forFruitDisease')}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FlaskConical className="w-5 h-5" />
                {t('recommendedProducts')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {products.map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-muted-foreground">NPK: {product.npkContent}</div>
                    </div>
                    <div className="text-xl font-bold text-primary">{product.quantity}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-4">
            <Card className="bg-growth/10 border-growth/30">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-5 h-5 text-growth" />
                  <span className="font-bold text-growth">{t('applicationMethod')}</span>
                </div>
                <p>{prediction.applicationMethod}</p>
              </CardContent>
            </Card>
            <Card className="bg-sky/10 border-sky/30">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-5 h-5 text-sky" />
                  <span className="font-bold text-sky">{t('bestTiming')}</span>
                </div>
                <p>{prediction.timing}</p>
              </CardContent>
            </Card>
          </div>

          {prediction.warnings.length > 0 && (
            <Card className="bg-secondary/10 border-secondary/30">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-5 h-5 text-secondary" />
                  <span className="font-bold text-secondary">{t('warnings')}</span>
                </div>
                <ul className="space-y-2">
                  {prediction.warnings.map((warning, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-secondary mt-1">•</span>
                      <span>{warning}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <h4 className="font-bold mb-2">{t('mlAlgoDetails')}</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• <strong>Type:</strong> Decision Tree + Weighted Multi-Factor Classification</li>
                <li>• <strong>Features:</strong> Crop type, soil type, growth stage, weather, temperature</li>
                <li>• <strong>Training Data:</strong> Agricultural research (ICAR, FAO recommendations)</li>
                <li>• <strong>Output:</strong> NPK ratios, quantities, application methods</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
