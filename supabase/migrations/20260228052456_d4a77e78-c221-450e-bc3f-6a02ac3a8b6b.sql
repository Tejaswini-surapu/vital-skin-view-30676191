
CREATE POLICY "Anyone can delete submissions" ON public.patient_submissions
  FOR DELETE USING (true);
