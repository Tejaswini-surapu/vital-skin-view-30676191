import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface MedicalDisclaimerProps {
  variant?: "default" | "compact";
}

const MedicalDisclaimer = ({ variant = "default" }: MedicalDisclaimerProps) => {
  if (variant === "compact") {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-2 rounded-lg">
        <AlertTriangle className="h-3 w-3 flex-shrink-0" />
        <span>For educational purposes only. Not a replacement for professional medical diagnosis.</span>
      </div>
    );
  }

  return (
    <Alert className="border-warning/30 bg-warning/5">
      <AlertTriangle className="h-5 w-5 text-warning" />
      <AlertTitle className="text-warning font-semibold">Medical Disclaimer</AlertTitle>
      <AlertDescription className="text-muted-foreground mt-2">
        <p>
          This system is developed for <strong>educational and research purposes only</strong>. 
          The predictions provided by this AI model should <strong>not</strong> be considered as 
          professional medical advice, diagnosis, or treatment.
        </p>
        <p className="mt-2">
          Always consult a qualified dermatologist or healthcare professional for accurate 
          diagnosis and appropriate treatment of any skin conditions.
        </p>
      </AlertDescription>
    </Alert>
  );
};

export default MedicalDisclaimer;
