import { Header } from "@/components/Header";
import { WeatherCard } from "@/components/WeatherCard";
import { CropCapture } from "@/components/CropCapture";
import { VoiceAssistant } from "@/components/VoiceAssistant";
import { FertilizerGuide } from "@/components/FertilizerGuide";
import { MLFertilizerPredictor } from "@/components/MLFertilizerPredictor";
import { Cloud, Sun, Mic, Leaf, ArrowDown, Brain } from "lucide-react";
import farmHero from "@/assets/farm-hero.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={farmHero} 
            alt="Beautiful farm landscape at sunrise" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-foreground/60 via-foreground/40 to-background" />
        </div>
        
        <div className="relative z-10 container mx-auto px-4 text-center pt-20">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-primary-foreground mb-6 animate-slide-up">
            Farm AI
          </h1>
          
          <p className="text-xl md:text-2xl text-primary-foreground/90 max-w-2xl mx-auto mb-8 animate-slide-up" style={{ animationDelay: "0.1s" }}>
            Your Smart Farming Companion - Weather alerts, crop analysis, and expert guidance in your language
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mb-12 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <div className="flex items-center gap-2 bg-primary-foreground/20 backdrop-blur-sm px-4 py-2 rounded-full">
              <Sun className="w-5 h-5 text-harvest" />
              <span className="text-primary-foreground font-medium">Weather Alerts</span>
            </div>
            <div className="flex items-center gap-2 bg-primary-foreground/20 backdrop-blur-sm px-4 py-2 rounded-full">
              <Mic className="w-5 h-5 text-accent" />
              <span className="text-primary-foreground font-medium">Voice in 9+ Languages</span>
            </div>
            <div className="flex items-center gap-2 bg-primary-foreground/20 backdrop-blur-sm px-4 py-2 rounded-full">
              <Leaf className="w-5 h-5 text-growth" />
              <span className="text-primary-foreground font-medium">Fertilizer Guide</span>
            </div>
          </div>
          
          <a 
            href="#weather" 
            className="inline-flex items-center gap-2 btn-farmer bg-primary text-primary-foreground animate-float"
          >
            Get Started <ArrowDown className="w-5 h-5" />
          </a>
        </div>
      </section>
      
      {/* Weather Section */}
      <section id="weather" className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-sky-light px-4 py-2 rounded-full mb-4">
              <Cloud className="w-5 h-5 text-sky" />
              <span className="font-medium text-sky">Today's Weather</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">Harvest Recommendation</h2>
            <p className="text-muted-foreground mt-2">Real-time weather analysis for your farm</p>
          </div>
          <div className="max-w-3xl mx-auto">
            <WeatherCard />
          </div>
        </div>
      </section>

      
      {/* Crop Capture & Voice Assistant Section */}
      <section id="capture" className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div>
              <CropCapture />
            </div>
            <div id="voice">
              <VoiceAssistant />
            </div>
          </div>
        </div>
      </section>
      
      {/* ML Fertilizer Predictor Section */}
      <section id="ml-predictor" className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <MLFertilizerPredictor />
          </div>
        </div>
      </section>

      {/* Fertilizer Guide Section */}
      <section id="fertilizer" className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <FertilizerGuide />
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-8 bg-foreground text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Leaf className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">Farm AI</span>
          </div>
          <p className="text-primary-foreground/70">
            Empowering farmers with smart technology
          </p>
          <p className="text-primary-foreground/50 text-sm mt-2">
            © 2024 Farm AI. Made with ❤️ for Farmers
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
