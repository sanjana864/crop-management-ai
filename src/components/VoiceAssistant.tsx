import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Volume2, Globe, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Web Speech API types
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition: new () => SpeechRecognitionInstance;
  }
}
const languages = [
  { code: "en-US", name: "English", flag: "🇬🇧" },
  { code: "hi-IN", name: "हिंदी (Hindi)", flag: "🇮🇳" },
  { code: "te-IN", name: "తెలుగు (Telugu)", flag: "🇮🇳" },
  { code: "ta-IN", name: "தமிழ் (Tamil)", flag: "🇮🇳" },
  { code: "mr-IN", name: "मराठी (Marathi)", flag: "🇮🇳" },
  { code: "bn-IN", name: "বাংলা (Bengali)", flag: "🇮🇳" },
  { code: "gu-IN", name: "ગુજરાતી (Gujarati)", flag: "🇮🇳" },
  { code: "kn-IN", name: "ಕನ್ನಡ (Kannada)", flag: "🇮🇳" },
  { code: "pa-IN", name: "ਪੰਜਾਬੀ (Punjabi)", flag: "🇮🇳" },
];

// Get farming response based on query
const getFarmingResponse = (query: string, lang: string): string => {
  const lowerQuery = query.toLowerCase();
  
  // Crop-specific responses
  if (lowerQuery.includes("rice") || lowerQuery.includes("paddy")) {
    if (lowerQuery.includes("plant") || lowerQuery.includes("sow")) {
      return "Rice is best planted during monsoon season (June-July). Prepare nursery beds 25-30 days before transplanting. Maintain 2-3 inches of standing water in paddy fields.";
    }
    if (lowerQuery.includes("harvest")) {
      return "Rice is ready for harvest when grains turn golden yellow and moisture content is 20-25%. Harvest 30-35 days after flowering. Dry grains to 14% moisture for storage.";
    }
    return "Rice requires 1200-1500mm water. Use SRI method for better yield. Apply 120kg nitrogen, 60kg phosphorus, 40kg potassium per hectare.";
  }
  
  if (lowerQuery.includes("wheat")) {
    if (lowerQuery.includes("plant") || lowerQuery.includes("sow")) {
      return "Wheat sowing time is November-December. Use 100-125 kg seeds per hectare. Maintain row spacing of 20-22.5 cm for optimal growth.";
    }
    if (lowerQuery.includes("harvest")) {
      return "Wheat is ready when grains are hard and golden. Harvest at 12-14% moisture. Best time is early morning after dew dries. Expected yield: 40-50 quintals per hectare.";
    }
    return "Wheat needs 4-6 irrigations. First at crown root stage (21 days), second at tillering, third at jointing, fourth at flowering, fifth at milking stage.";
  }
  
  if (lowerQuery.includes("sugarcane")) {
    if (lowerQuery.includes("plant")) {
      return "Plant sugarcane in February-March or September-October. Use 3-budded setts from disease-free cane. Maintain 90-100 cm row spacing.";
    }
    if (lowerQuery.includes("harvest")) {
      return "Sugarcane matures in 10-12 months. Harvest when brix reading is 18-20%. Cut cane close to ground for better ratoon crop.";
    }
    return "Sugarcane needs regular irrigation every 7-10 days. Earthing up at 90 and 120 days is essential. Apply trash mulching for moisture retention.";
  }
  
  if (lowerQuery.includes("cotton")) {
    if (lowerQuery.includes("plant") || lowerQuery.includes("sow")) {
      return "Cotton is sown in May-June with onset of monsoon. Use 2-2.5 kg seeds per hectare. Maintain plant spacing of 60x30 cm.";
    }
    if (lowerQuery.includes("pest") || lowerQuery.includes("bollworm")) {
      return "For bollworm control, use pheromone traps and neem-based sprays. Release Trichogramma wasps for biological control. Avoid excessive nitrogen.";
    }
    return "Cotton needs 700-1200mm water. Pick cotton when bolls fully open. First picking 150-160 days after sowing, continue every 15 days.";
  }
  
  if (lowerQuery.includes("tomato")) {
    if (lowerQuery.includes("plant")) {
      return "Transplant tomato seedlings 25-30 days old. Space plants 60x45 cm apart. Stake plants when they reach 30 cm height.";
    }
    if (lowerQuery.includes("disease") || lowerQuery.includes("blight")) {
      return "For late blight, apply copper-based fungicides. Remove infected leaves immediately. Ensure proper spacing for air circulation.";
    }
    return "Tomatoes need 600-800mm water. Harvest when fruits turn red. Apply calcium to prevent blossom end rot.";
  }
  
  if (lowerQuery.includes("maize") || lowerQuery.includes("corn")) {
    if (lowerQuery.includes("plant") || lowerQuery.includes("sow")) {
      return "Sow maize in June-July for kharif or January-February for rabi. Use 20-25 kg seeds per hectare. Maintain 60x20 cm spacing.";
    }
    if (lowerQuery.includes("harvest")) {
      return "Maize is ready when husks turn brown and kernels are hard. Harvest at 25% moisture for grain, 35% for silage.";
    }
    return "Maize needs 500-600mm water. Apply nitrogen in 3 splits - at sowing, knee-high stage, and tasseling.";
  }
  
  // General topic responses
  if (lowerQuery.includes("water") || lowerQuery.includes("irrigation")) {
    return "For optimal irrigation, water crops early morning or late evening to minimize evaporation. Use drip irrigation to save 30-40% water. Check soil moisture 2-3 inches deep before watering.";
  }
  
  if (lowerQuery.includes("pest") || lowerQuery.includes("insect")) {
    return "For integrated pest management: Use pheromone traps for monitoring, release natural predators like ladybugs, apply neem oil spray weekly, and rotate crops annually.";
  }
  
  if (lowerQuery.includes("disease") || lowerQuery.includes("fungus") || lowerQuery.includes("infection")) {
    return "For disease control: Remove infected plants immediately, apply copper-based fungicides, ensure proper drainage, use disease-resistant varieties, and practice crop rotation.";
  }
  
  if (lowerQuery.includes("fertilizer") || lowerQuery.includes("nutrient") || lowerQuery.includes("manure")) {
    return "Apply fertilizers based on soil test. General NPK ratio is 4:2:1 for most crops. Use organic manure 2-3 tons per hectare. Apply nitrogen in splits for better uptake.";
  }
  
  if (lowerQuery.includes("weather") || lowerQuery.includes("rain") || lowerQuery.includes("climate")) {
    return "Monitor weather forecasts daily. Delay fertilizer application before rain. Prepare drainage channels before monsoon. Cover nurseries during hailstorm warnings.";
  }
  
  if (lowerQuery.includes("seed") || lowerQuery.includes("sowing") || lowerQuery.includes("plant")) {
    return "Use certified seeds from authorized dealers. Treat seeds with Thiram or Carbendazim before sowing. Check germination rate - should be above 85%.";
  }
  
  if (lowerQuery.includes("soil") || lowerQuery.includes("land")) {
    return "Test soil every 2-3 years for pH and nutrients. Add lime if pH is below 6.0, add sulfur if above 7.5. Incorporate organic matter to improve soil structure.";
  }
  
  if (lowerQuery.includes("price") || lowerQuery.includes("market") || lowerQuery.includes("sell")) {
    return "Check AGMARKNET portal for daily mandi prices. Consider direct selling through Farmer Producer Organizations. Store produce properly to sell when prices are favorable.";
  }
  
  if (lowerQuery.includes("loan") || lowerQuery.includes("subsidy") || lowerQuery.includes("scheme")) {
    return "Apply for Kisan Credit Card for easy loans. Check PM-KISAN scheme for direct income support. Visit nearest agriculture office for subsidy information on equipment.";
  }
  
  if (lowerQuery.includes("hello") || lowerQuery.includes("hi") || lowerQuery.includes("hey")) {
    return "Hello! I'm your farming assistant. Ask me about crop cultivation, irrigation, pest control, fertilizers, weather guidance, market prices, or government schemes. How can I help you today?";
  }
  
  if (lowerQuery.includes("thank")) {
    return "You're welcome! Feel free to ask more questions about farming. I'm here to help you grow better crops and improve your farm productivity.";
  }
  
  return "I can help you with farming queries about specific crops (rice, wheat, cotton, sugarcane, tomato, maize), irrigation, pest control, fertilizers, soil health, weather, market prices, and government schemes. Please ask a specific question!";
};

export const VoiceAssistant = () => {
  const [isListening, setIsListening] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("en-US");
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  useEffect(() => {
    // Check for browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event) => {
        const current = event.resultIndex;
        const transcriptResult = event.results[current][0].transcript;
        setTranscript(transcriptResult);
        
        if (event.results[current].isFinal) {
          setIsListening(false);
          setIsProcessing(true);
          
          // Generate response
          setTimeout(() => {
            const farmResponse = getFarmingResponse(transcriptResult, selectedLanguage);
            setResponse(farmResponse);
            setIsProcessing(false);
          }, 500);
        }
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
        setError(`Error: ${event.error}. Please try again.`);
        setTimeout(() => setError(""), 3000);
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [selectedLanguage]);

  const toggleListening = () => {
    setError("");
    
    if (!recognitionRef.current) {
      setError("Speech recognition is not supported in your browser. Please use Chrome or Edge.");
      return;
    }
    
    if (!isListening) {
      setTranscript("");
      setResponse("");
      recognitionRef.current.lang = selectedLanguage;
      
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error("Failed to start recognition:", err);
        setError("Failed to start microphone. Please check permissions.");
      }
    } else {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const speakResponse = () => {
    if ('speechSynthesis' in window && response) {
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(response);
      utterance.lang = selectedLanguage;
      utterance.rate = 0.9;
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="feature-card">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Mic className="w-6 h-6 text-primary" />
        Voice Assistant
      </h3>
      
      <div className="mb-4">
        <label className="text-sm font-medium mb-2 flex items-center gap-2">
          <Globe className="w-4 h-4" />
          Select Your Language
        </label>
        <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            {languages.map((lang) => (
              <SelectItem key={lang.code} value={lang.code}>
                <span className="flex items-center gap-2">
                  <span>{lang.flag}</span>
                  <span>{lang.name}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
          {error}
        </div>
      )}
      
      <div className="flex flex-col items-center py-6">
        <button
          onClick={toggleListening}
          disabled={isProcessing}
          className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
            isListening 
              ? 'bg-destructive text-destructive-foreground animate-pulse-glow shadow-glow scale-110' 
              : isProcessing
              ? 'bg-muted text-muted-foreground cursor-not-allowed'
              : 'bg-primary text-primary-foreground hover:scale-105 shadow-card'
          }`}
        >
          {isProcessing ? (
            <Loader2 className="w-10 h-10 animate-spin" />
          ) : isListening ? (
            <MicOff className="w-10 h-10" />
          ) : (
            <Mic className="w-10 h-10" />
          )}
        </button>
        <p className="mt-4 text-lg font-medium">
          {isProcessing 
            ? "Processing..." 
            : isListening 
            ? "Listening... Speak now" 
            : "Tap to ask a question"}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Ask about harvesting, irrigation, pests, fertilizers, or weather
        </p>
      </div>
      
      {transcript && (
        <div className="mt-4 p-4 bg-muted rounded-xl">
          <p className="text-sm text-muted-foreground mb-1">You said:</p>
          <p className="font-medium">{transcript}</p>
        </div>
      )}
      
      {response && (
        <div className="mt-4 p-4 bg-growth-light border-2 border-growth rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-growth">Assistant Response:</p>
            <Button variant="ghost" size="sm" onClick={speakResponse}>
              <Volume2 className="w-4 h-4 mr-1" /> Listen
            </Button>
          </div>
          <p className="text-foreground">{response}</p>
        </div>
      )}
    </div>
  );
};
