import riceField from "@/assets/crops/rice-field.jpg";
import wheatField from "@/assets/crops/wheat-field.jpg";
import sugarcane from "@/assets/crops/sugarcane.jpg";
import cottonField from "@/assets/crops/cotton-field.jpg";
import tomatoes from "@/assets/crops/tomatoes.jpg";
import maize from "@/assets/crops/maize.jpg";
import { Leaf } from "lucide-react";

interface Crop {
  name: string;
  image: string;
  season: string;
  duration: string;
}

const crops: Crop[] = [
  { name: "Rice", image: riceField, season: "Kharif", duration: "3-6 months" },
  { name: "Wheat", image: wheatField, season: "Rabi", duration: "4-5 months" },
  { name: "Sugarcane", image: sugarcane, season: "Year-round", duration: "12-18 months" },
  { name: "Cotton", image: cottonField, season: "Kharif", duration: "5-6 months" },
  { name: "Tomato", image: tomatoes, season: "All seasons", duration: "2-3 months" },
  { name: "Maize", image: maize, season: "Kharif/Rabi", duration: "3-4 months" },
];

export const CropShowcase = () => {
  return (
    <div className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-growth-light px-4 py-2 rounded-full mb-4">
            <Leaf className="w-5 h-5 text-growth" />
            <span className="font-medium text-growth">Popular Crops</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold">Crops We Support</h2>
          <p className="text-muted-foreground mt-2">Get expert guidance for these common crops</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {crops.map((crop) => (
            <div
              key={crop.name}
              className="group relative overflow-hidden rounded-2xl bg-card shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer"
            >
              <div className="aspect-square overflow-hidden">
                <img
                  src={crop.image}
                  alt={crop.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3 text-primary-foreground">
                <h3 className="font-bold text-lg">{crop.name}</h3>
                <p className="text-xs text-primary-foreground/80">{crop.season}</p>
                <p className="text-xs text-primary-foreground/60">{crop.duration}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
