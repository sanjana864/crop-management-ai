-- Create table for farm/crop data
CREATE TABLE public.farms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  farm_name TEXT NOT NULL,
  location TEXT,
  soil_type TEXT,
  area_acres DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for crops grown on farms
CREATE TABLE public.crops (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  farm_id UUID REFERENCES public.farms(id) ON DELETE CASCADE,
  crop_name TEXT NOT NULL,
  season TEXT,
  planting_date DATE,
  expected_harvest_date DATE,
  status TEXT DEFAULT 'growing',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for fertilizer query history
CREATE TABLE public.fertilizer_queries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  crop_name TEXT NOT NULL,
  soil_type TEXT,
  question TEXT NOT NULL,
  ai_response TEXT NOT NULL,
  language TEXT DEFAULT 'en',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fertilizer_queries ENABLE ROW LEVEL SECURITY;

-- Create public read/write policies (since no auth yet)
CREATE POLICY "Allow public read on farms" ON public.farms FOR SELECT USING (true);
CREATE POLICY "Allow public insert on farms" ON public.farms FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on farms" ON public.farms FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on farms" ON public.farms FOR DELETE USING (true);

CREATE POLICY "Allow public read on crops" ON public.crops FOR SELECT USING (true);
CREATE POLICY "Allow public insert on crops" ON public.crops FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on crops" ON public.crops FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on crops" ON public.crops FOR DELETE USING (true);

CREATE POLICY "Allow public read on fertilizer_queries" ON public.fertilizer_queries FOR SELECT USING (true);
CREATE POLICY "Allow public insert on fertilizer_queries" ON public.fertilizer_queries FOR INSERT WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_farms_updated_at
  BEFORE UPDATE ON public.farms
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_crops_updated_at
  BEFORE UPDATE ON public.crops
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();