import { Header } from "@/components/Header";
import { WeatherCard } from "@/components/WeatherCard";
import { CropCapture } from "@/components/CropCapture";
import { VoiceAssistant } from "@/components/VoiceAssistant";
import { FertilizerGuide } from "@/components/FertilizerGuide";
import { MLFertilizerPredictor } from "@/components/MLFertilizerPredictor";
import { WorkflowStep } from "@/components/WorkflowStep";
import { Cloud, Sun, Mic, Leaf, ArrowDown, Brain, Camera, FlaskConical, BookOpen, ChevronDown } from "lucide-react";
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
            Your Smart Farming Companion - Follow the steps below for expert guidance
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mb-12 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <div className="flex items-center gap-2 bg-primary-foreground/20 backdrop-blur-sm px-4 py-2 rounded-full">
              <Sun className="w-5 h-5 text-harvest" />
              <span className="text-primary-foreground font-medium">Step 1: Weather</span>
            </div>
            <div className="flex items-center gap-2 bg-primary-foreground/20 backdrop-blur-sm px-4 py-2 rounded-full">
              <Camera className="w-5 h-5 text-accent" />
              <span className="text-primary-foreground font-medium">Step 2: Crop Analysis</span>
            </div>
            <div className="flex items-center gap-2 bg-primary-foreground/20 backdrop-blur-sm px-4 py-2 rounded-full">
              <Brain className="w-5 h-5 text-growth" />
              <span className="text-primary-foreground font-medium">Step 3: ML Predictor</span>
            </div>
            <div className="flex items-center gap-2 bg-primary-foreground/20 backdrop-blur-sm px-4 py-2 rounded-full">
              <BookOpen className="w-5 h-5 text-sky" />
              <span className="text-primary-foreground font-medium">Step 4: Guide</span>
            </div>
          </div>
          
          <a 
            href="#workflow" 
            className="inline-flex items-center gap-2 btn-farmer bg-primary text-primary-foreground animate-float"
          >
            Start Workflow <ArrowDown className="w-5 h-5" />
          </a>
        </div>
      </section>

      {/* Workflow Overview */}
      <section id="workflow" className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-2">How It Works</h2>
            <p className="text-muted-foreground">Follow these 4 simple steps for smart farming</p>
          </div>
          <div className="grid md:grid-cols-2 gap-x-8">
            <WorkflowStep
              step={1}
              title="Check Weather"
              description="Get real-time weather & harvest recommendations for your location."
              icon={<Cloud className="w-6 h-6" />}
            />
            <WorkflowStep
              step={2}
              title="Analyze Your Crop"
              description="Capture or upload a photo for disease detection, or ask voice questions."
              icon={<Camera className="w-6 h-6" />}
            />
            <WorkflowStep
              step={3}
              title="ML Fertilizer Prediction"
              description="Enter crop & soil details to get precise NPK recommendations."
              icon={<Brain className="w-6 h-6" />}
            />
            <WorkflowStep
              step={4}
              title="Read Fertilizer Guide"
              description="Browse detailed guides for your specific crop and soil type."
              icon={<BookOpen className="w-6 h-6" />}
              isLast
            />
          </div>
          <div className="text-center mt-8">
            <a href="#weather" className="inline-flex items-center gap-2 text-primary font-semibold hover:underline">
              Begin Step 1 <ChevronDown className="w-5 h-5" />
            </a>
          </div>
        </div>
      </section>
      
      {/* Step 1: Weather Section */}
      <section id="weather" className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-sky/10 px-4 py-2 rounded-full mb-4">
              <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">1</div>
              <Cloud className="w-5 h-5 text-sky" />
              <span className="font-medium text-sky">Check Weather</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">Weather & Harvest Recommendation</h2>
            <p className="text-muted-foreground mt-2">Real-time weather analysis for your farm location</p>
          </div>
          <div className="max-w-3xl mx-auto">
            <WeatherCard />
          </div>
          <div className="text-center mt-8">
            <a href="#capture" className="inline-flex items-center gap-2 text-primary font-semibold hover:underline">
              Next: Crop Analysis <ChevronDown className="w-5 h-5" />
            </a>
          </div>
        </div>
      </section>

      {/* Step 2: Crop Capture & Voice Assistant Section */}
      <section id="capture" className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-accent/10 px-4 py-2 rounded-full mb-4">
              <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">2</div>
              <Camera className="w-5 h-5 text-accent" />
              <span className="font-medium text-accent">Analyze Crop & Ask Questions</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">Crop Analysis & Voice Help</h2>
            <p className="text-muted-foreground mt-2">Upload a crop photo or ask questions in your language</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div>
              <CropCapture />
            </div>
            <div id="voice">
              <VoiceAssistant />
            </div>
          </div>
          <div className="text-center mt-8">
            <a href="#ml-predictor" className="inline-flex items-center gap-2 text-primary font-semibold hover:underline">
              Next: ML Fertilizer Predictor <ChevronDown className="w-5 h-5" />
            </a>
          </div>
        </div>
      </section>
      
      {/* Step 3: ML Fertilizer Predictor Section */}
      <section id="ml-predictor" className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-4">
              <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">3</div>
              <Brain className="w-5 h-5 text-primary" />
              <span className="font-medium text-primary">ML-Powered Prediction</span>
            </div>
          </div>
          <div className="max-w-4xl mx-auto">
            <MLFertilizerPredictor />
          </div>
          <div className="text-center mt-8">
            <a href="#fertilizer" className="inline-flex items-center gap-2 text-primary font-semibold hover:underline">
              Next: Fertilizer Guide <ChevronDown className="w-5 h-5" />
            </a>
          </div>
        </div>
      </section>

      {/* Step 4: Fertilizer Guide Section */}
      <section id="fertilizer" className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-growth/10 px-4 py-2 rounded-full mb-4">
              <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">4</div>
              <BookOpen className="w-5 h-5 text-growth" />
              <span className="font-medium text-growth">Fertilizer Guide</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">Detailed Fertilizer Guide</h2>
            <p className="text-muted-foreground mt-2">Comprehensive crop-specific fertilizer recommendations</p>
          </div>
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
