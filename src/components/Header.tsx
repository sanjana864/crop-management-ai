import { Sprout, Menu, X, Globe } from "lucide-react";
import { useState } from "react";
import { useLanguage, Language } from "@/contexts/LanguageContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const languages: { code: Language; label: string; flag: string }[] = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'ta', label: 'தமிழ்', flag: '🇮🇳' },
  { code: 'hi', label: 'हिंदी', flag: '🇮🇳' },
  { code: 'te', label: 'తెలుగు', flag: '🇮🇳' },
];

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Sprout className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">Farm AI</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            <a href="#workflow" className="font-medium hover:text-primary transition-colors">{t('howItWorks')}</a>
            <a href="#weather" className="font-medium hover:text-primary transition-colors">① {t('weather')}</a>
            <a href="#capture" className="font-medium hover:text-primary transition-colors">② {t('cropAnalysis')}</a>
            <a href="#ml-predictor" className="font-medium hover:text-primary transition-colors">③ {t('mlPredictor')}</a>
            <a href="#fertilizer" className="font-medium hover:text-primary transition-colors">④ {t('guide')}</a>
          </nav>

          <div className="flex items-center gap-2">
            <Select value={language} onValueChange={(v) => setLanguage(v as Language)}>
              <SelectTrigger className="w-[130px] bg-background border-input">
                <Globe className="w-4 h-4 mr-1" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background border border-input shadow-lg z-[60]">
                {languages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    <span className="flex items-center gap-2">
                      <span>{lang.flag}</span>
                      <span>{lang.label}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <button 
              className="md:hidden p-2" 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
        
        {isMenuOpen && (
          <nav className="md:hidden pt-4 pb-2 space-y-2">
            <a href="#workflow" className="block py-2 font-medium hover:text-primary transition-colors" onClick={() => setIsMenuOpen(false)}>{t('howItWorks')}</a>
            <a href="#weather" className="block py-2 font-medium hover:text-primary transition-colors" onClick={() => setIsMenuOpen(false)}>① {t('weather')}</a>
            <a href="#capture" className="block py-2 font-medium hover:text-primary transition-colors" onClick={() => setIsMenuOpen(false)}>② {t('cropAnalysis')}</a>
            <a href="#ml-predictor" className="block py-2 font-medium hover:text-primary transition-colors" onClick={() => setIsMenuOpen(false)}>③ {t('mlPredictor')}</a>
            <a href="#fertilizer" className="block py-2 font-medium hover:text-primary transition-colors" onClick={() => setIsMenuOpen(false)}>④ {t('guide')}</a>
          </nav>
        )}
      </div>
    </header>
  );
};
