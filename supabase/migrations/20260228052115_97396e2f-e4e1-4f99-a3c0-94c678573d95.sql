
ALTER TABLE public.patient_submissions
  ADD COLUMN mobile_number text,
  ADD COLUMN address text,
  ADD COLUMN token_number text,
  ADD COLUMN entered_by text,
  ADD COLUMN cause text,
  ADD COLUMN model_results jsonb;
