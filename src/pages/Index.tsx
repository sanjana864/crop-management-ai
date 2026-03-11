import { Header } from "@/components/Header";
import { WeatherCard } from "@/components/WeatherCard";
import { CropCapture } from "@/components/CropCapture";
import { VoiceAssistant } from "@/components/VoiceAssistant";
import { FertilizerGuide } from "@/components/FertilizerGuide";
import { MLFertilizerPredictor } from "@/components/MLFertilizerPredictor";
import { WorkflowStep } from "@/components/WorkflowStep";
import { Cloud, Sun, Mic, Leaf, ArrowDown, Brain, Camera, FlaskConical, BookOpen, ChevronDown } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import farmHero from "@/assets/farm-hero.jpg";

const Index = () => {
  const { t } = useLanguage();

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
            {t('appName')}
          </h1>
          
          <p className="text-xl md:text-2xl text-primary-foreground/90 max-w-2xl mx-auto mb-8 animate-slide-up" style={{ animationDelay: "0.1s" }}>
            {t('subtitle')}
          </p>
          
          <a 
            href="#workflow" 
            className="inline-flex items-center gap-2 btn-farmer bg-primary text-primary-foreground animate-float"
          >
            {t('getStarted')} <ArrowDown className="w-5 h-5" />
          </a>
        </div>
      </section>

      {/* Workflow Overview */}
      <section id="workflow" className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-2">{t('howItWorks')}</h2>
            <p className="text-muted-foreground">{t('howItWorksSubtitle')}</p>
          </div>
          <div className="grid md:grid-cols-2 gap-x-8">
            <WorkflowStep
              step={1}
              title={t('checkWeather')}
              description={t('checkWeatherDesc')}
              icon={<Cloud className="w-6 h-6" />}
            />
            <WorkflowStep
              step={2}
              title={t('analyzeCrop')}
              description={t('analyzeCropDesc')}
              icon={<Camera className="w-6 h-6" />}
            />
            <WorkflowStep
              step={3}
              title={t('mlPrediction')}
              description={t('mlPredictionDesc')}
              icon={<Brain className="w-6 h-6" />}
            />
            <WorkflowStep
              step={4}
              title={t('fertilizerGuide')}
              description={t('fertilizerGuideDesc')}
              icon={<BookOpen className="w-6 h-6" />}
              isLast
            />
          </div>
          <div className="text-center mt-8">
            <a href="#weather" className="inline-flex items-center gap-2 text-primary font-semibold hover:underline">
              {t('beginStep1')} <ChevronDown className="w-5 h-5" />
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
              <span className="font-medium text-sky">{t('checkWeather')}</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">{t('weatherTitle')}</h2>
            <p className="text-muted-foreground mt-2">{t('weatherSubtitle')}</p>
          </div>
          <div className="max-w-3xl mx-auto">
            <WeatherCard />
          </div>
          <div className="text-center mt-8">
            <a href="#capture" className="inline-flex items-center gap-2 text-primary font-semibold hover:underline">
              {t('nextCropAnalysis')} <ChevronDown className="w-5 h-5" />
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
              <span className="font-medium text-accent">{t('analyzeAndAsk')}</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">{t('cropAnalysisTitle')}</h2>
            <p className="text-muted-foreground mt-2">{t('cropAnalysisSubtitle')}</p>
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
              {t('nextMLPredictor')} <ChevronDown className="w-5 h-5" />
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
              <span className="font-medium text-primary">{t('mlPowered')}</span>
            </div>
          </div>
          <div className="max-w-4xl mx-auto">
            <MLFertilizerPredictor />
          </div>
          <div className="text-center mt-8">
            <a href="#fertilizer" className="inline-flex items-center gap-2 text-primary font-semibold hover:underline">
              {t('nextFertilizerGuide')} <ChevronDown className="w-5 h-5" />
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
              <span className="font-medium text-growth">{t('fertilizerGuide')}</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">{t('detailedFertilizerGuide')}</h2>
            <p className="text-muted-foreground mt-2">{t('detailedFertilizerGuideSubtitle')}</p>
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
            {t('empowering')}
          </p>
          <p className="text-primary-foreground/50 text-sm mt-2">
            {t('copyright')}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
