import { useState } from "react";
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

// Types for ML prediction
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
const soilTypes: { value: SoilType; label: string }[] = [
  { value: 'clay', label: 'Clay Soil' },
  { value: 'sandy', label: 'Sandy Soil' },
  { value: 'loamy', label: 'Loamy Soil' },
  { value: 'black', label: 'Black Soil' },
  { value: 'red', label: 'Red Soil' },
  { value: 'alluvial', label: 'Alluvial Soil' },
];
const growthStages: { value: GrowthStage; label: string }[] = [
  { value: 'seedling', label: 'Seedling Stage' },
  { value: 'vegetative', label: 'Vegetative Growth' },
  { value: 'flowering', label: 'Flowering Stage' },
  { value: 'fruiting', label: 'Fruiting Stage' },
  { value: 'maturity', label: 'Maturity Stage' },
];
const weatherConditions: { value: WeatherCondition; label: string }[] = [
  { value: 'dry', label: 'Dry' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'rainy', label: 'Rainy' },
  { value: 'humid', label: 'Humid' },
];

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

  const handlePredict = async () => {
    if (!input.crop) {
      toast.error("Please select a crop");
      return;
    }

    setIsCalculating(true);
    
    try {
      // Call the backend ML edge function
      const { data, error } = await supabase.functions.invoke('ml-fertilizer', {
        body: input as MLInput
      });

      if (error) {
        throw error;
      }

      setPrediction(data.prediction);
      setProducts(data.products);

      // Save prediction to database
      await supabase.from('fertilizer_queries').insert({
        crop_name: input.crop,
        soil_type: input.soilType,
        question: `ML Prediction: ${input.growthStage} stage, ${input.weather} weather, ${input.temperature}°C`,
        ai_response: JSON.stringify(data.prediction),
        language: 'en'
      });

      toast.success("ML prediction complete from backend!");
    } catch (error) {
      console.error('ML prediction error:', error);
      toast.error("Failed to get prediction. Please try again.");
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-4">
          <Brain className="w-5 h-5 text-primary" />
          <span className="font-medium text-primary">ML-Powered Prediction</span>
          <Server className="w-4 h-4 text-muted-foreground" />
        </div>
        <h3 className="text-2xl font-bold mb-2">Fertilizer Predictor</h3>
        <p className="text-muted-foreground">
          Server-side Decision Tree + Weighted Scoring Algorithm
        </p>
      </div>

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FlaskConical className="w-5 h-5" />
            Input Parameters
          </CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Leaf className="w-4 h-4 text-growth" />
              Crop Type
            </Label>
            <Select value={input.crop} onValueChange={(v) => setInput({ ...input, crop: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Select crop" />
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
              Soil Type
            </Label>
            <Select value={input.soilType} onValueChange={(v) => setInput({ ...input, soilType: v as SoilType })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {soilTypes.map((soil) => (
                  <SelectItem key={soil.value} value={soil.value}>{soil.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Growth Stage
            </Label>
            <Select value={input.growthStage} onValueChange={(v) => setInput({ ...input, growthStage: v as GrowthStage })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {growthStages.map((stage) => (
                  <SelectItem key={stage.value} value={stage.value}>{stage.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <CloudRain className="w-4 h-4 text-sky" />
              Weather Condition
            </Label>
            <Select value={input.weather} onValueChange={(v) => setInput({ ...input, weather: v as WeatherCondition })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {weatherConditions.map((w) => (
                  <SelectItem key={w.value} value={w.value}>{w.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <ThermometerSun className="w-4 h-4 text-harvest" />
              Temperature (°C)
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
            <Label>Farm Area (Acres)</Label>
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
            Running ML Algorithm...
          </>
        ) : (
          <>
            <Brain className="w-5 h-5 mr-2" />
            Predict Fertilizer Requirements
          </>
        )}
      </Button>

      {/* Prediction Results */}
      {prediction && (
        <div className="space-y-4 animate-slide-up">
          {/* Confidence Score */}
          <Card className="border-primary/30">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Prediction Confidence</span>
                <span className="text-2xl font-bold text-primary">{prediction.confidence}%</span>
              </div>
              <Progress value={prediction.confidence} className="h-3" />
              <p className="text-sm text-muted-foreground mt-2">
                Based on Decision Tree classification with weighted scoring
              </p>
            </CardContent>
          </Card>

          {/* NPK Recommendations */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200">
              <CardContent className="pt-6 text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">{prediction.nitrogen}</div>
                <div className="text-sm text-blue-700 font-medium">kg Nitrogen (N)</div>
                <div className="text-xs text-muted-foreground mt-1">For leaf growth & chlorophyll</div>
              </CardContent>
            </Card>
            <Card className="bg-orange-50 dark:bg-orange-950/30 border-orange-200">
              <CardContent className="pt-6 text-center">
                <div className="text-4xl font-bold text-orange-600 mb-2">{prediction.phosphorus}</div>
                <div className="text-sm text-orange-700 font-medium">kg Phosphorus (P)</div>
                <div className="text-xs text-muted-foreground mt-1">For root development</div>
              </CardContent>
            </Card>
            <Card className="bg-purple-50 dark:bg-purple-950/30 border-purple-200">
              <CardContent className="pt-6 text-center">
                <div className="text-4xl font-bold text-purple-600 mb-2">{prediction.potassium}</div>
                <div className="text-sm text-purple-700 font-medium">kg Potassium (K)</div>
                <div className="text-xs text-muted-foreground mt-1">For fruit & disease resistance</div>
              </CardContent>
            </Card>
          </div>

          {/* Fertilizer Products */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FlaskConical className="w-5 h-5" />
                Recommended Fertilizer Products
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

          {/* Application Method & Timing */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="bg-growth/10 border-growth/30">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-5 h-5 text-growth" />
                  <span className="font-bold text-growth">Application Method</span>
                </div>
                <p>{prediction.applicationMethod}</p>
              </CardContent>
            </Card>
            <Card className="bg-sky/10 border-sky/30">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-5 h-5 text-sky" />
                  <span className="font-bold text-sky">Best Timing</span>
                </div>
                <p>{prediction.timing}</p>
              </CardContent>
            </Card>
          </div>

          {/* Warnings */}
          {prediction.warnings.length > 0 && (
            <Card className="bg-secondary/10 border-secondary/30">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-5 h-5 text-secondary" />
                  <span className="font-bold text-secondary">Warnings</span>
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

          {/* Algorithm Info */}
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <h4 className="font-bold mb-2">🧠 ML Algorithm Details</h4>
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
