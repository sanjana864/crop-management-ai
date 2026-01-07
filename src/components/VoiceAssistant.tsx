import { useState } from "react";
import { Mic, MicOff, Volume2, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const languages = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "hi", name: "हिंदी (Hindi)", flag: "🇮🇳" },
  { code: "te", name: "తెలుగు (Telugu)", flag: "🇮🇳" },
  { code: "ta", name: "தமிழ் (Tamil)", flag: "🇮🇳" },
  { code: "mr", name: "मराठी (Marathi)", flag: "🇮🇳" },
  { code: "bn", name: "বাংলা (Bengali)", flag: "🇮🇳" },
  { code: "gu", name: "ગુજરાતી (Gujarati)", flag: "🇮🇳" },
  { code: "kn", name: "ಕನ್ನಡ (Kannada)", flag: "🇮🇳" },
  { code: "pa", name: "ਪੰਜਾਬੀ (Punjabi)", flag: "🇮🇳" },
];

export const VoiceAssistant = () => {
  const [isListening, setIsListening] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");

  const toggleListening = () => {
    if (!isListening) {
      setIsListening(true);
      setTranscript("");
      setResponse("");
      // Simulated voice recognition
      setTimeout(() => {
        setTranscript("When should I harvest my wheat crop?");
        setIsListening(false);
        setTimeout(() => {
          setResponse("Based on your location and current weather, your wheat crop should be ready for harvest in 2-3 weeks. Look for golden color and dry stalks. Best time to harvest is early morning when dew has dried.");
        }, 1000);
      }, 3000);
    } else {
      setIsListening(false);
    }
  };

  const speakResponse = () => {
    if ('speechSynthesis' in window && response) {
      const utterance = new SpeechSynthesisUtterance(response);
      utterance.lang = selectedLanguage;
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
      
      <div className="flex flex-col items-center py-6">
        <button
          onClick={toggleListening}
          className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
            isListening 
              ? 'bg-destructive text-destructive-foreground animate-pulse-glow shadow-glow scale-110' 
              : 'bg-primary text-primary-foreground hover:scale-105 shadow-card'
          }`}
        >
          {isListening ? (
            <MicOff className="w-10 h-10" />
          ) : (
            <Mic className="w-10 h-10" />
          )}
        </button>
        <p className="mt-4 text-lg font-medium">
          {isListening ? "Listening... Speak now" : "Tap to ask a question"}
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
