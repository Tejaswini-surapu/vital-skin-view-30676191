
-- Create patient_submissions table
CREATE TABLE public.patient_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_name TEXT NOT NULL,
  patient_age INTEGER NOT NULL,
  days_suffering INTEGER NOT NULL,
  image_url TEXT NOT NULL,
  predicted_disease TEXT NOT NULL,
  confidence NUMERIC NOT NULL,
  description TEXT,
  reasoning TEXT,
  recommendations TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS (but allow public access since no auth)
ALTER TABLE public.patient_submissions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert submissions
CREATE POLICY "Anyone can insert submissions"
ON public.patient_submissions
FOR INSERT
WITH CHECK (true);

-- Allow anyone to read submissions (for doctor dashboard)
CREATE POLICY "Anyone can view submissions"
ON public.patient_submissions
FOR SELECT
USING (true);

-- Create storage bucket for skin images
INSERT INTO storage.buckets (id, name, public) VALUES ('skin-images', 'skin-images', true);

-- Allow anyone to upload images
CREATE POLICY "Anyone can upload skin images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'skin-images');

-- Allow anyone to view skin images
CREATE POLICY "Anyone can view skin images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'skin-images');
