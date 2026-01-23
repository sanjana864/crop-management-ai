import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Types
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

// ML Model Data - Base NPK requirements per crop (kg/acre)
const cropBaseNPK: Record<string, { n: number; p: number; k: number }> = {
  'Rice': { n: 120, p: 60, k: 40 },
  'Wheat': { n: 100, p: 50, k: 30 },
  'Cotton': { n: 80, p: 40, k: 40 },
  'Tomato': { n: 100, p: 80, k: 60 },
  'Sugarcane': { n: 150, p: 60, k: 80 },
  'Potato': { n: 120, p: 80, k: 100 },
  'Maize': { n: 120, p: 60, k: 40 },
  'Groundnut': { n: 20, p: 40, k: 40 },
};

// Soil type adjustment weights
const soilWeights: Record<SoilType, { n: number; p: number; k: number }> = {
  'clay': { n: 0.9, p: 1.1, k: 0.95 },
  'sandy': { n: 1.2, p: 1.3, k: 1.2 },
  'loamy': { n: 1.0, p: 1.0, k: 1.0 },
  'black': { n: 0.85, p: 1.0, k: 0.9 },
  'red': { n: 1.1, p: 1.2, k: 1.1 },
  'alluvial': { n: 0.95, p: 0.95, k: 0.95 },
};

// Growth stage adjustment weights
const growthStageWeights: Record<GrowthStage, { n: number; p: number; k: number }> = {
  'seedling': { n: 0.3, p: 0.5, k: 0.2 },
  'vegetative': { n: 0.8, p: 0.4, k: 0.3 },
  'flowering': { n: 0.5, p: 0.8, k: 0.6 },
  'fruiting': { n: 0.4, p: 0.6, k: 0.9 },
  'maturity': { n: 0.2, p: 0.3, k: 0.5 },
};

// Weather condition factors
const weatherFactors: Record<WeatherCondition, number> = {
  'dry': 0.8,
  'moderate': 1.0,
  'rainy': 1.15,
  'humid': 1.05,
};

// Decision Tree for Application Method
function getApplicationMethod(input: MLInput): string {
  if (input.growthStage === 'seedling') {
    return 'Basal application: Mix fertilizer with soil before transplanting';
  }
  if (input.weather === 'rainy') {
    return 'Foliar spray: Apply during dry periods to prevent nutrient runoff';
  }
  if (input.soilType === 'sandy') {
    return 'Split application: Divide into 3-4 doses to prevent leaching';
  }
  if (input.growthStage === 'flowering' || input.growthStage === 'fruiting') {
    return 'Side dressing: Apply near plant roots for quick absorption';
  }
  return 'Broadcasting: Spread evenly across field followed by irrigation';
}

// Decision Tree for Timing
function getTiming(input: MLInput): string {
  if (input.weather === 'rainy') {
    return 'Apply in early morning when soil is moist but not waterlogged';
  }
  if (input.temperature > 35) {
    return 'Apply in evening (after 4 PM) to prevent fertilizer burn';
  }
  if (input.temperature < 15) {
    return 'Apply during mid-day when temperature is optimal for absorption';
  }
  if (input.growthStage === 'flowering') {
    return 'Apply 2-3 weeks before expected flowering for best results';
  }
  return 'Apply early morning (6-9 AM) followed by light irrigation';
}

// Warning generation based on conditions
function generateWarnings(input: MLInput, prediction: { n: number; p: number; k: number }): string[] {
  const warnings: string[] = [];
  
  if (input.temperature > 38) {
    warnings.push('High temperature detected. Reduce nitrogen by 20% to prevent leaf burn.');
  }
  if (input.weather === 'rainy' && input.soilType === 'sandy') {
    warnings.push('Risk of nutrient leaching in sandy soil during rain. Consider split application.');
  }
  if (prediction.n > 150) {
    warnings.push('High nitrogen recommendation. Monitor for excessive vegetative growth.');
  }
  if (input.growthStage === 'maturity') {
    warnings.push('Crop is near harvest. Minimize fertilizer application to avoid residue.');
  }
  if (input.soilType === 'clay' && input.weather === 'humid') {
    warnings.push('Risk of waterlogging in clay soil. Ensure proper drainage before application.');
  }
  
  return warnings;
}

// Confidence calculation based on input completeness and model certainty
function calculateConfidence(input: MLInput): number {
  let confidence = 85;
  
  if (cropBaseNPK[input.crop]) confidence += 5;
  if (input.temperature >= 20 && input.temperature <= 35) confidence += 3;
  if (input.weather === 'moderate') confidence += 2;
  if (input.growthStage === 'vegetative' || input.growthStage === 'flowering') confidence += 2;
  
  return Math.min(confidence, 98);
}

// Main ML Prediction Function
function predictFertilizer(input: MLInput): MLPrediction {
  const baseNPK = cropBaseNPK[input.crop] || { n: 100, p: 50, k: 40 };
  const soilWeight = soilWeights[input.soilType];
  const stageWeight = growthStageWeights[input.growthStage];
  const weatherFactor = weatherFactors[input.weather];
  
  // Temperature adjustment
  let tempFactor = 1.0;
  if (input.temperature < 15) tempFactor = 0.8;
  else if (input.temperature > 35) tempFactor = 0.9;
  
  // Calculate NPK values
  const nitrogen = Math.round(
    baseNPK.n * soilWeight.n * stageWeight.n * weatherFactor * tempFactor * input.areaAcres
  );
  const phosphorus = Math.round(
    baseNPK.p * soilWeight.p * stageWeight.p * weatherFactor * tempFactor * input.areaAcres
  );
  const potassium = Math.round(
    baseNPK.k * soilWeight.k * stageWeight.k * weatherFactor * tempFactor * input.areaAcres
  );
  
  return {
    nitrogen,
    phosphorus,
    potassium,
    confidence: calculateConfidence(input),
    applicationMethod: getApplicationMethod(input),
    timing: getTiming(input),
    warnings: generateWarnings(input, { n: nitrogen, p: phosphorus, k: potassium }),
  };
}

// Get fertilizer product recommendations
function getFertilizerProducts(prediction: MLPrediction): FertilizerProduct[] {
  const products: FertilizerProduct[] = [];
  
  // Urea for Nitrogen (46% N)
  const ureaQty = Math.round((prediction.nitrogen / 0.46) * 10) / 10;
  products.push({
    name: 'Urea',
    npkContent: '46-0-0',
    quantity: `${ureaQty} kg`,
  });
  
  // DAP for Phosphorus (18% N, 46% P)
  const dapQty = Math.round((prediction.phosphorus / 0.46) * 10) / 10;
  products.push({
    name: 'DAP (Di-Ammonium Phosphate)',
    npkContent: '18-46-0',
    quantity: `${dapQty} kg`,
  });
  
  // MOP for Potassium (60% K)
  const mopQty = Math.round((prediction.potassium / 0.6) * 10) / 10;
  products.push({
    name: 'MOP (Muriate of Potash)',
    npkContent: '0-0-60',
    quantity: `${mopQty} kg`,
  });
  
  return products;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const input: MLInput = await req.json();
    
    // Validate input
    if (!input.crop) {
      return new Response(
        JSON.stringify({ error: "Crop type is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("ML Prediction request for crop:", input.crop);

    // Run ML prediction
    const prediction = predictFertilizer(input);
    const products = getFertilizerProducts(prediction);

    console.log("ML Prediction complete with confidence:", prediction.confidence);

    return new Response(
      JSON.stringify({ prediction, products }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in ml-fertilizer function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "An error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
