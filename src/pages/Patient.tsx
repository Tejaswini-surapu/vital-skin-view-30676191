import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Info, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MedicalDisclaimer from "@/components/MedicalDisclaimer";
import ImageUploader from "@/components/ImageUploader";
import { predictSkinDisease } from "@/lib/skinDiseaseService";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

const Patient = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [patientName, setPatientName] = useState("");
  const [patientAge, setPatientAge] = useState("");
  const [daysSuffering, setDaysSuffering] = useState("");

  const handleImageSelect = async (file: File, preview: string) => {
    if (!patientName.trim() || !patientAge || !daysSuffering) {
      toast({
        variant: "destructive",
        title: "Missing Details",
        description: "Please fill in your name, age, and days suffering before analyzing.",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await predictSkinDisease(file);

      // Upload image to storage
      const fileExt = file.name.split('.').pop();
      const filePath = `${crypto.randomUUID()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('skin-images')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error('Failed to upload image');
      }

      const { data: urlData } = supabase.storage
        .from('skin-images')
        .getPublicUrl(filePath);

      // Save submission to database
      const { error: insertError } = await supabase
        .from('patient_submissions')
        .insert({
          patient_name: patientName.trim(),
          patient_age: parseInt(patientAge),
          days_suffering: parseInt(daysSuffering),
          image_url: urlData.publicUrl,
          predicted_disease: result.disease,
          confidence: result.confidence,
          description: result.description,
          reasoning: result.reasoning || null,
          recommendations: result.recommendations,
        });

      if (insertError) {
        console.error('Insert error:', insertError);
      }

      navigate("/results", {
        state: {
          prediction: result,
          imagePreview: preview,
          fileName: file.name
        }
      });
    } catch (error) {
      console.error("Prediction error:", error);
      
      const errorMessage = error instanceof Error ? error.message : "Analysis failed";
      
      if (errorMessage.includes('Rate limit')) {
        toast({
          variant: "destructive",
          title: "Rate Limit Exceeded",
          description: "Please wait a moment and try again.",
        });
      } else if (errorMessage.includes('credits')) {
        toast({
          variant: "destructive",
          title: "AI Credits Exhausted",
          description: "Please add credits to your workspace to continue.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Analysis Failed",
          description: errorMessage,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-8 md:py-12">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center p-3 rounded-full bg-primary/10 mb-4">
              <Camera className="h-8 w-8 text-primary" />
            </div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-3">
              Patient Portal
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Fill in your details and upload a clear image of the affected skin area for AI-powered analysis.
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            {/* Patient Details */}
            <div className="bg-card rounded-2xl shadow-card p-6 md:p-8 border border-border/50 mb-6">
              <h2 className="font-heading text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                  1
                </span>
                Patient Details
              </h2>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter your name"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="e.g. 25"
                    min="1"
                    max="150"
                    value={patientAge}
                    onChange={(e) => setPatientAge(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="days">Days Suffering</Label>
                  <Input
                    id="days"
                    type="number"
                    placeholder="e.g. 7"
                    min="0"
                    value={daysSuffering}
                    onChange={(e) => setDaysSuffering(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            {/* Upload Section */}
            <div className="bg-card rounded-2xl shadow-card p-6 md:p-8 border border-border/50">
              <h2 className="font-heading text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                  2
                </span>
                Upload Skin Image
              </h2>
              
              <ImageUploader 
                onImageSelect={handleImageSelect}
                isLoading={isLoading}
              />

              {/* AI Badge */}
              <div className="mt-6 flex items-center justify-center gap-2 text-sm text-primary">
                <Sparkles className="h-4 w-4" />
                <span className="font-medium">Powered by Gemini Vision AI</span>
              </div>

              {/* Tips */}
              <div className="mt-6 p-4 rounded-lg bg-muted/50 border border-border">
                <h3 className="font-medium text-foreground flex items-center gap-2 mb-3">
                  <Info className="h-4 w-4 text-primary" />
                  Tips for Best Results
                </h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                    Use natural or bright lighting without shadows
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                    Keep the camera steady and in focus
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                    Capture the entire affected area clearly
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                    Avoid using flash if it causes glare
                  </li>
                </ul>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="mt-6">
              <MedicalDisclaimer variant="compact" />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Patient;
