/**
 * Fertilizer Recommendation ML Algorithm
 * Uses Decision Tree + Weighted Scoring approach
 * 
 * Algorithm: Multi-factor weighted classification
 * - Input features: crop type, soil type, weather, growth stage
 * - Output: NPK ratio, quantity, application method
 */

export type SoilType = 'clay' | 'sandy' | 'loamy' | 'black' | 'red' | 'alluvial';
export type GrowthStage = 'seedling' | 'vegetative' | 'flowering' | 'fruiting' | 'maturity';
export type WeatherCondition = 'dry' | 'moderate' | 'rainy' | 'humid';

export interface MLInput {
  crop: string;
  soilType: SoilType;
  growthStage: GrowthStage;
  weather: WeatherCondition;
  temperature: number; // in Celsius
  rainfall: number; // in mm
  areaAcres: number;
}

export interface MLPrediction {
  nitrogen: number; // kg/acre
  phosphorus: number; // kg/acre
  potassium: number; // kg/acre
  confidence: number; // 0-100%
  recommendation: string;
  applicationMethod: string;
  timing: string;
  warnings: string[];
}

// Training data: Base NPK requirements per crop (kg/ha)
const cropBaseNPK: Record<string, { n: number; p: number; k: number }> = {
  rice: { n: 120, p: 60, k: 40 },
  wheat: { n: 120, p: 60, k: 40 },
  cotton: { n: 120, p: 60, k: 60 },
  tomato: { n: 100, p: 50, k: 50 },
  sugarcane: { n: 150, p: 60, k: 60 },
  potato: { n: 120, p: 80, k: 100 },
  maize: { n: 120, p: 60, k: 40 },
  groundnut: { n: 25, p: 50, k: 40 },
};

// Soil type adjustment weights (multipliers)
const soilWeights: Record<SoilType, { n: number; p: number; k: number }> = {
  clay: { n: 0.9, p: 1.1, k: 0.95 }, // Retains N, needs more P
  sandy: { n: 1.2, p: 1.15, k: 1.2 }, // Leaches nutrients, needs more
  loamy: { n: 1.0, p: 1.0, k: 1.0 }, // Ideal soil, baseline
  black: { n: 0.85, p: 1.0, k: 0.9 }, // Rich in nutrients
  red: { n: 1.1, p: 1.2, k: 1.1 }, // Low in P
  alluvial: { n: 0.95, p: 0.95, k: 0.95 }, // Fertile soil
};

// Growth stage weights
const stageWeights: Record<GrowthStage, { n: number; p: number; k: number }> = {
  seedling: { n: 0.3, p: 0.5, k: 0.2 },
  vegetative: { n: 0.8, p: 0.3, k: 0.3 },
  flowering: { n: 0.4, p: 0.6, k: 0.5 },
  fruiting: { n: 0.2, p: 0.4, k: 0.7 },
  maturity: { n: 0.1, p: 0.2, k: 0.3 },
};

// Weather adjustment factors
const weatherFactors: Record<WeatherCondition, { efficiency: number; leaching: number }> = {
  dry: { efficiency: 0.7, leaching: 0.1 },
  moderate: { efficiency: 1.0, leaching: 0.2 },
  rainy: { efficiency: 0.8, leaching: 0.4 },
  humid: { efficiency: 0.9, leaching: 0.3 },
};

/**
 * Decision Tree Node for application method
 */
function decideApplicationMethod(input: MLInput): string {
  // Decision tree logic
  if (input.weather === 'rainy') {
    if (input.soilType === 'sandy') {
      return 'Foliar spray (to reduce leaching)';
    }
    return 'Band placement near roots';
  }
  
  if (input.growthStage === 'seedling') {
    return 'Basal application at planting';
  }
  
  if (input.growthStage === 'vegetative' || input.growthStage === 'flowering') {
    if (input.crop === 'rice') {
      return 'Apply in standing water';
    }
    return 'Side dressing near plant base';
  }
  
  if (input.soilType === 'sandy') {
    return 'Split application (2-3 doses)';
  }
  
  return 'Broadcasting and incorporation';
}

/**
 * Decision Tree for timing recommendation
 */
function decideTiming(input: MLInput): string {
  if (input.weather === 'rainy') {
    return 'Apply before expected rain stops, or wait 2-3 days after heavy rain';
  }
  
  if (input.temperature > 35) {
    return 'Apply early morning (6-8 AM) or evening (5-7 PM) to avoid volatilization';
  }
  
  if (input.growthStage === 'flowering') {
    return 'Apply immediately - critical nutrient uptake period';
  }
  
  return 'Apply when soil is moist, preferably morning hours';
}

/**
 * Generate warnings using rule-based classification
 */
function generateWarnings(input: MLInput, prediction: Partial<MLPrediction>): string[] {
  const warnings: string[] = [];
  
  // High nitrogen warning
  if ((prediction.nitrogen || 0) > 60) {
    warnings.push('High nitrogen - risk of leaf burn. Split into 2-3 applications.');
  }
  
  // Weather-based warnings
  if (input.weather === 'rainy' && input.soilType === 'sandy') {
    warnings.push('High leaching risk. Consider slow-release fertilizers.');
  }
  
  if (input.temperature > 38) {
    warnings.push('Extreme heat - delay application to avoid volatilization losses.');
  }
  
  if (input.weather === 'dry' && input.rainfall < 10) {
    warnings.push('Dry conditions - irrigate before or immediately after application.');
  }
  
  // Crop-specific warnings
  if (input.crop === 'rice' && input.weather !== 'rainy') {
    warnings.push('Rice requires standing water for optimal nutrient uptake.');
  }
  
  if (input.crop === 'cotton' && input.growthStage === 'maturity') {
    warnings.push('Avoid nitrogen near harvest - delays maturity and reduces quality.');
  }
  
  return warnings;
}

/**
 * Calculate confidence score based on input completeness and conditions
 */
function calculateConfidence(input: MLInput): number {
  let confidence = 70; // Base confidence
  
  // Boost confidence for known crops
  if (cropBaseNPK[input.crop.toLowerCase()]) {
    confidence += 15;
  }
  
  // Boost for ideal conditions
  if (input.soilType === 'loamy') confidence += 5;
  if (input.weather === 'moderate') confidence += 5;
  if (input.temperature >= 20 && input.temperature <= 30) confidence += 5;
  
  return Math.min(confidence, 98);
}

/**
 * Main ML Prediction Function
 * Algorithm: Weighted Multi-Factor Classification with Decision Trees
 */
export function predictFertilizer(input: MLInput): MLPrediction {
  const cropKey = input.crop.toLowerCase();
  
  // Get base NPK or use default
  const baseNPK = cropBaseNPK[cropKey] || { n: 100, p: 50, k: 50 };
  
  // Get weights
  const soilW = soilWeights[input.soilType];
  const stageW = stageWeights[input.growthStage];
  const weatherF = weatherFactors[input.weather];
  
  // Calculate adjusted NPK using weighted formula
  // Formula: Base × SoilWeight × StageWeight × (1 + LeachingFactor) × AreaConversion
  const haToAcre = 0.4047; // Convert kg/ha to kg/acre
  
  let nitrogen = baseNPK.n * soilW.n * stageW.n * (1 + weatherF.leaching) * haToAcre;
  let phosphorus = baseNPK.p * soilW.p * stageW.p * haToAcre;
  let potassium = baseNPK.k * soilW.k * stageW.k * haToAcre;
  
  // Apply efficiency factor based on weather
  nitrogen *= weatherF.efficiency;
  phosphorus *= weatherF.efficiency;
  potassium *= weatherF.efficiency;
  
  // Temperature adjustment (volatilization increases with temperature)
  if (input.temperature > 30) {
    const tempFactor = 1 + (input.temperature - 30) * 0.02;
    nitrogen *= tempFactor;
  }
  
  // Scale by area
  nitrogen = Math.round(nitrogen * input.areaAcres * 10) / 10;
  phosphorus = Math.round(phosphorus * input.areaAcres * 10) / 10;
  potassium = Math.round(potassium * input.areaAcres * 10) / 10;
  
  const prediction: MLPrediction = {
    nitrogen,
    phosphorus,
    potassium,
    confidence: calculateConfidence(input),
    recommendation: `Apply ${nitrogen}kg N, ${phosphorus}kg P, ${potassium}kg K for ${input.areaAcres} acre(s)`,
    applicationMethod: decideApplicationMethod(input),
    timing: decideTiming(input),
    warnings: [],
  };
  
  prediction.warnings = generateWarnings(input, prediction);
  
  return prediction;
}

/**
 * Get fertilizer product recommendations based on NPK needs
 */
export function getFertilizerProducts(prediction: MLPrediction): Array<{
  name: string;
  quantity: string;
  npkContent: string;
}> {
  const products = [];
  
  // Urea for Nitrogen (46% N)
  if (prediction.nitrogen > 0) {
    const ureaQty = Math.round((prediction.nitrogen / 0.46) * 10) / 10;
    products.push({
      name: 'Urea',
      quantity: `${ureaQty} kg`,
      npkContent: '46-0-0',
    });
  }
  
  // DAP for Phosphorus (18% N, 46% P)
  if (prediction.phosphorus > 0) {
    const dapQty = Math.round((prediction.phosphorus / 0.46) * 10) / 10;
    products.push({
      name: 'DAP (Di-Ammonium Phosphate)',
      quantity: `${dapQty} kg`,
      npkContent: '18-46-0',
    });
  }
  
  // MOP for Potassium (60% K)
  if (prediction.potassium > 0) {
    const mopQty = Math.round((prediction.potassium / 0.60) * 10) / 10;
    products.push({
      name: 'MOP (Muriate of Potash)',
      quantity: `${mopQty} kg`,
      npkContent: '0-0-60',
    });
  }
  
  return products;
}
