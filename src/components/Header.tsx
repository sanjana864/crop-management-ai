import { Sprout, Menu, X } from "lucide-react";
import { useState } from "react";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
            <a href="#weather" className="font-medium hover:text-primary transition-colors">Weather</a>
            <a href="#capture" className="font-medium hover:text-primary transition-colors">Crop Analysis</a>
            <a href="#voice" className="font-medium hover:text-primary transition-colors">Voice Help</a>
            <a href="#fertilizer" className="font-medium hover:text-primary transition-colors">Fertilizers</a>
          </nav>
          
          <button 
            className="md:hidden p-2" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        
        {isMenuOpen && (
          <nav className="md:hidden pt-4 pb-2 space-y-2">
            <a href="#weather" className="block py-2 font-medium hover:text-primary transition-colors">Weather</a>
            <a href="#capture" className="block py-2 font-medium hover:text-primary transition-colors">Crop Analysis</a>
            <a href="#voice" className="block py-2 font-medium hover:text-primary transition-colors">Voice Help</a>
            <a href="#fertilizer" className="block py-2 font-medium hover:text-primary transition-colors">Fertilizers</a>
          </nav>
        )}
      </div>
    </header>
  );
};
