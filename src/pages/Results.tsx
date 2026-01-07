import { useLocation, useNavigate, Link } from "react-router-dom";
import { useEffect } from "react";
import { CheckCircle2, AlertTriangle, RotateCcw, Home, TrendingUp, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MedicalDisclaimer from "@/components/MedicalDisclaimer";
import { getDiseaseInfo } from "@/lib/skinDiseaseService";

interface ResultsState {
  prediction: {
    disease: string;
    confidence: number;
    description: string;
    recommendations: string[];
  };
  imagePreview: string;
  fileName: string;
}

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as ResultsState | null;

  useEffect(() => {
    // Redirect if no state (direct access)
    if (!state) {
      navigate("/patient");
    }
  }, [state, navigate]);

  if (!state) return null;

  const { prediction, imagePreview, fileName } = state;
  const diseaseInfo = getDiseaseInfo(prediction.disease);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return "text-success";
    if (confidence >= 75) return "text-primary";
    return "text-warning";
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 90) return "High Confidence";
    if (confidence >= 75) return "Moderate Confidence";
    return "Low Confidence";
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-8 md:py-12">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center p-3 rounded-full bg-success/10 mb-4">
              <CheckCircle2 className="h-8 w-8 text-success" />
            </div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-3">
              Analysis Complete
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              The AI model has analyzed your uploaded image. Review the prediction results below.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            {/* Main Results Card */}
            <div className="bg-card rounded-2xl shadow-card border border-border/50 overflow-hidden mb-6">
              <div className="grid md:grid-cols-2">
                {/* Image Section */}
                <div className="p-6 bg-muted/30 flex flex-col items-center justify-center">
                  <p className="text-xs text-muted-foreground mb-3 font-medium">UPLOADED IMAGE</p>
                  <div className="relative w-full max-w-xs">
                    <img
                      src={imagePreview}
                      alt="Analyzed skin"
                      className="w-full rounded-xl shadow-lg object-cover aspect-square"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-3 truncate max-w-full">
                    {fileName}
                  </p>
                </div>

                {/* Prediction Section */}
                <div className="p-6 md:p-8 flex flex-col justify-center">
                  <p className="text-xs text-muted-foreground mb-2 font-medium tracking-wider">
                    PREDICTED CONDITION
                  </p>
                  <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-4">
                    {prediction.disease}
                  </h2>
                  
                  <p className="text-muted-foreground mb-6">
                    {prediction.description}
                  </p>

                  {/* Confidence Score */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Confidence Score
                      </span>
                      <span className={`text-lg font-bold ${getConfidenceColor(prediction.confidence)}`}>
                        {prediction.confidence.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={prediction.confidence} className="h-2" />
                    <p className={`text-xs ${getConfidenceColor(prediction.confidence)}`}>
                      {getConfidenceLabel(prediction.confidence)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            {diseaseInfo && (
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                {/* Symptoms */}
                <div className="bg-card rounded-xl shadow-card p-6 border border-border/50">
                  <h3 className="font-heading font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Info className="h-4 w-4 text-primary" />
                    Common Symptoms
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {diseaseInfo.symptoms.map((symptom, i) => (
                      <span key={i} className="px-3 py-1.5 text-sm rounded-full bg-secondary text-secondary-foreground">
                        {symptom}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Recommendations */}
                <div className="bg-card rounded-xl shadow-card p-6 border border-border/50">
                  <h3 className="font-heading font-semibold text-foreground mb-4 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    Recommendations
                  </h3>
                  <ul className="space-y-2">
                    {prediction.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="w-1.5 h-1.5 rounded-full bg-success mt-1.5 flex-shrink-0" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Important Notice */}
            <div className="bg-warning/5 border border-warning/20 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">Important Notice</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    This prediction is generated by an AI model for educational purposes only. 
                    Please consult a qualified dermatologist for professional diagnosis and treatment.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="medical-gradient">
                <Link to="/patient">
                  <RotateCcw className="mr-2 h-5 w-5" />
                  Analyze Another Image
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/">
                  <Home className="mr-2 h-5 w-5" />
                  Back to Home
                </Link>
              </Button>
            </div>

            {/* Disclaimer */}
            <div className="mt-8">
              <MedicalDisclaimer />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Results;
