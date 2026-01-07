import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin } from "lucide-react";

export interface Location {
  name: string;
  lat: number;
  lon: number;
}

export const LOCATIONS: Location[] = [
  { name: "Current Location", lat: 0, lon: 0 },
  { name: "Chennai", lat: 13.0827, lon: 80.2707 },
  { name: "Mumbai", lat: 19.076, lon: 72.8777 },
  { name: "Delhi", lat: 28.6139, lon: 77.209 },
  { name: "Bangalore", lat: 12.9716, lon: 77.5946 },
  { name: "Hyderabad", lat: 17.385, lon: 78.4867 },
  { name: "Kolkata", lat: 22.5726, lon: 88.3639 },
  { name: "Pune", lat: 18.5204, lon: 73.8567 },
  { name: "Jaipur", lat: 26.9124, lon: 75.7873 },
  { name: "Lucknow", lat: 26.8467, lon: 80.9462 },
  { name: "Ahmedabad", lat: 23.0225, lon: 72.5714 },
];

interface LocationSelectorProps {
  selectedLocation: string;
  onLocationChange: (locationName: string) => void;
}

export const LocationSelector = ({
  selectedLocation,
  onLocationChange,
}: LocationSelectorProps) => {
  return (
    <div className="flex items-center gap-2">
      <MapPin className="w-5 h-5 text-primary" />
      <Select value={selectedLocation} onValueChange={onLocationChange}>
        <SelectTrigger className="w-[180px] bg-background border-input">
          <SelectValue placeholder="Select location" />
        </SelectTrigger>
        <SelectContent className="bg-background border border-input shadow-lg z-50">
          {LOCATIONS.map((location) => (
            <SelectItem
              key={location.name}
              value={location.name}
              className="cursor-pointer hover:bg-muted"
            >
              {location.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
