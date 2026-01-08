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
  
  if (lowerQuery.includes("harvest") || lowerQuery.includes("wheat")) {
    return "Based on your location and current weather, your wheat crop should be ready for harvest in 2-3 weeks. Look for golden color and dry stalks. Best time to harvest is early morning when dew has dried.";
  }
  if (lowerQuery.includes("water") || lowerQuery.includes("irrigation")) {
    return "For optimal irrigation, water your crops early morning or late evening to minimize evaporation. Check soil moisture 2-3 inches deep before watering.";
  }
  if (lowerQuery.includes("pest") || lowerQuery.includes("disease")) {
    return "For pest control, use neem-based organic pesticides. Inspect crops regularly and remove affected leaves. Maintain proper spacing between plants for air circulation.";
  }
  if (lowerQuery.includes("fertilizer") || lowerQuery.includes("nutrient")) {
    return "Apply NPK fertilizer based on soil test results. For most crops, apply nitrogen in split doses. Use organic compost to improve soil health.";
  }
  if (lowerQuery.includes("weather") || lowerQuery.includes("rain")) {
    return "Check the weather forecast before planning field activities. If rain is expected, delay fertilizer application. Cover sensitive crops during heavy rainfall.";
  }
  if (lowerQuery.includes("seed") || lowerQuery.includes("sowing")) {
    return "Use certified seeds from authorized dealers. Treat seeds with fungicide before sowing. Maintain proper seed spacing for optimal growth.";
  }
  
  return "I can help you with farming queries about harvesting, irrigation, pest control, fertilizers, weather guidance, and seed selection. Please ask a specific question about your crops.";
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
