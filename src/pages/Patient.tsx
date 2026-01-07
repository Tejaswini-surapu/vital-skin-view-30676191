import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Info } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MedicalDisclaimer from "@/components/MedicalDisclaimer";
import ImageUploader from "@/components/ImageUploader";
import { predictSkinDisease, PredictionResult } from "@/lib/skinDiseaseService";

const Patient = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleImageSelect = async (file: File, preview: string) => {
    setIsLoading(true);
    
    try {
      const result = await predictSkinDisease(file);
      
      // Navigate to results page with state
      navigate("/results", {
        state: {
          prediction: result,
          imagePreview: preview,
          fileName: file.name
        }
      });
    } catch (error) {
      console.error("Prediction error:", error);
      alert("An error occurred during analysis. Please try again.");
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
              Upload a clear image of the affected skin area for AI-powered analysis. 
              Ensure good lighting and focus for best results.
            </p>
          </div>

          {/* Upload Section */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-card rounded-2xl shadow-card p-6 md:p-8 border border-border/50">
              <h2 className="font-heading text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                  1
                </span>
                Upload Skin Image
              </h2>
              
              <ImageUploader 
                onImageSelect={handleImageSelect}
                isLoading={isLoading}
              />

              {/* Tips */}
              <div className="mt-8 p-4 rounded-lg bg-muted/50 border border-border">
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
