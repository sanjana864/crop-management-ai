import { useState, useRef } from "react";
import { Camera, Upload, X, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const CropCapture = () => {
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCapture = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
        analyzeImage();
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = () => {
    setIsAnalyzing(true);
    setAnalysis(null);
    // Simulated analysis - in production, this would use AI
    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalysis("🌾 Crop appears healthy! Good moisture levels detected. Recommended action: Continue regular watering schedule. Estimated time to harvest: 2-3 weeks.");
    }, 2000);
  };

  const clearImage = () => {
    setImage(null);
    setAnalysis(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="feature-card">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Camera className="w-6 h-6 text-primary" />
        Crop Image Analysis
      </h3>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />
      
      {!image ? (
        <div 
          onClick={handleCapture}
          className="border-2 border-dashed border-primary/30 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all duration-300 min-h-[200px]"
        >
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Camera className="w-8 h-8 text-primary" />
          </div>
          <p className="text-lg font-semibold text-center">Tap to Capture Crop Image</p>
          <p className="text-muted-foreground text-center mt-1">or upload from gallery</p>
          <div className="flex gap-3 mt-4">
            <Button variant="outline" size="lg" className="gap-2">
              <Camera className="w-5 h-5" /> Camera
            </Button>
            <Button variant="outline" size="lg" className="gap-2">
              <Upload className="w-5 h-5" /> Upload
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative">
            <img 
              src={image} 
              alt="Captured crop" 
              className="w-full h-48 object-cover rounded-xl"
            />
            <button
              onClick={clearImage}
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {isAnalyzing ? (
            <div className="flex items-center justify-center gap-3 p-4 bg-muted rounded-xl">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="font-medium">Analyzing your crop...</span>
            </div>
          ) : analysis ? (
            <div className="p-4 bg-growth-light border-2 border-growth rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-growth" />
                <span className="font-bold">Analysis Complete</span>
              </div>
              <p className="text-foreground">{analysis}</p>
            </div>
          ) : null}
          
          <Button onClick={handleCapture} className="w-full btn-farmer bg-primary text-primary-foreground">
            <Camera className="w-5 h-5 mr-2" /> Capture New Image
          </Button>
        </div>
      )}
    </div>
  );
};
