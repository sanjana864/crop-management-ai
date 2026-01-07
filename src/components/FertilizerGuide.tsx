import { useState } from "react";
import { Leaf, Droplets, Calendar, AlertTriangle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CropFertilizer {
  name: string;
  icon: string;
  npkRatio: string;
  frequency: string;
  bestTime: string;
  quantity: string;
  tips: string[];
  warnings: string[];
}

const crops: CropFertilizer[] = [
  {
    name: "Rice (Paddy)",
    icon: "🌾",
    npkRatio: "120:60:40 kg/ha",
    frequency: "3 applications",
    bestTime: "Apply 1/2 nitrogen at transplanting, 1/4 at tillering, 1/4 at panicle initiation",
    quantity: "50 kg Urea + 30 kg DAP per acre",
    tips: [
      "Apply fertilizer in standing water",
      "Best applied in morning or evening",
      "Use zinc sulfate if leaves turn yellow"
    ],
    warnings: [
      "Avoid fertilizer during heavy rain",
      "Don't apply all nitrogen at once"
    ]
  },
  {
    name: "Wheat",
    icon: "🌿",
    npkRatio: "120:60:40 kg/ha",
    frequency: "2-3 applications",
    bestTime: "Apply full P&K at sowing, split nitrogen",
    quantity: "50 kg Urea + 25 kg DAP per acre",
    tips: [
      "First irrigation after fertilizer is must",
      "Apply urea when soil is moist",
      "Top dressing at crown root stage"
    ],
    warnings: [
      "Heavy nitrogen causes lodging",
      "Avoid fertilizer on wet foliage"
    ]
  },
  {
    name: "Cotton",
    icon: "🌱",
    npkRatio: "120:60:60 kg/ha",
    frequency: "4-5 applications",
    bestTime: "Split nitrogen through season",
    quantity: "60 kg Urea + 30 kg MOP per acre",
    tips: [
      "Apply potash for better fiber quality",
      "Foliar spray of 2% urea during flowering",
      "Use micronutrients for higher yield"
    ],
    warnings: [
      "Excess nitrogen delays maturity",
      "Stop nitrogen 30 days before picking"
    ]
  },
  {
    name: "Tomato",
    icon: "🍅",
    npkRatio: "100:50:50 kg/ha",
    frequency: "5-6 applications",
    bestTime: "Apply through drip or fertigation",
    quantity: "40 kg Urea + 20 kg MOP per acre",
    tips: [
      "High potash for better fruit quality",
      "Calcium spray prevents blossom end rot",
      "Weekly fertigation gives best results"
    ],
    warnings: [
      "Avoid high nitrogen after fruiting",
      "Monitor for calcium deficiency"
    ]
  },
  {
    name: "Sugarcane",
    icon: "🎋",
    npkRatio: "250:100:120 kg/ha",
    frequency: "3-4 applications",
    bestTime: "Apply in furrows and earthing up",
    quantity: "100 kg Urea + 50 kg DAP per acre",
    tips: [
      "Apply potash before monsoon",
      "Organic manure improves soil health",
      "Ring application is most effective"
    ],
    warnings: [
      "Late nitrogen reduces sugar content",
      "Avoid waterlogged conditions after fertilizer"
    ]
  },
  {
    name: "Potato",
    icon: "🥔",
    npkRatio: "120:80:100 kg/ha",
    frequency: "2-3 applications",
    bestTime: "Basal dose + earthing up",
    quantity: "50 kg Urea + 40 kg MOP per acre",
    tips: [
      "High potash for tuber development",
      "Apply sulfur for better skin quality",
      "Side dressing at 30 days"
    ],
    warnings: [
      "Excess nitrogen causes hollow heart",
      "Don't apply fertilizer touching tubers"
    ]
  }
];

export const FertilizerGuide = () => {
  const [selectedCrop, setSelectedCrop] = useState<CropFertilizer | null>(null);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold flex items-center justify-center gap-2 mb-2">
          <Leaf className="w-7 h-7 text-primary" />
          Fertilizer Guide
        </h3>
        <p className="text-muted-foreground">Select your crop to get detailed fertilizer recommendations</p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {crops.map((crop) => (
          <button
            key={crop.name}
            onClick={() => setSelectedCrop(crop)}
            className={`p-4 rounded-xl text-center transition-all duration-300 ${
              selectedCrop?.name === crop.name
                ? 'bg-primary text-primary-foreground shadow-glow scale-105'
                : 'bg-card border border-border hover:border-primary hover:shadow-card'
            }`}
          >
            <span className="text-3xl block mb-2">{crop.icon}</span>
            <span className="font-medium text-sm">{crop.name}</span>
          </button>
        ))}
      </div>
      
      {selectedCrop && (
        <div className="feature-card animate-slide-up">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-5xl">{selectedCrop.icon}</span>
            <div>
              <h4 className="text-2xl font-bold">{selectedCrop.name}</h4>
              <p className="text-muted-foreground">Complete fertilizer guide</p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-growth-light rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Leaf className="w-5 h-5 text-growth" />
                <span className="font-bold">NPK Ratio</span>
              </div>
              <p className="text-lg font-semibold">{selectedCrop.npkRatio}</p>
            </div>
            <div className="p-4 bg-sky-light rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Droplets className="w-5 h-5 text-sky" />
                <span className="font-bold">Quantity</span>
              </div>
              <p className="text-lg font-semibold">{selectedCrop.quantity}</p>
            </div>
            <div className="p-4 bg-earth-light rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-earth" />
                <span className="font-bold">Frequency</span>
              </div>
              <p className="text-lg font-semibold">{selectedCrop.frequency}</p>
            </div>
            <div className="p-4 bg-muted rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <span className="font-bold">Best Time</span>
              </div>
              <p className="font-medium">{selectedCrop.bestTime}</p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-growth/10 rounded-xl border border-growth/30">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-5 h-5 text-growth" />
                <span className="font-bold text-growth">Tips for Best Results</span>
              </div>
              <ul className="space-y-2">
                {selectedCrop.tips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-growth mt-1">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="p-4 bg-secondary/10 rounded-xl border border-secondary/30">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-secondary" />
                <span className="font-bold text-secondary">Warnings</span>
              </div>
              <ul className="space-y-2">
                {selectedCrop.warnings.map((warning, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-secondary mt-1">•</span>
                    <span>{warning}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
