import { useState } from "react";
import { Stethoscope, Brain, Layers, AlertCircle, CheckCircle, BookOpen, Users, Calendar, Clock, Eye } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MedicalDisclaimer from "@/components/MedicalDisclaimer";
import { SKIN_DISEASES } from "@/lib/skinDiseaseService";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface PatientSubmission {
  id: string;
  patient_name: string;
  patient_age: number;
  days_suffering: number;
  image_url: string;
  predicted_disease: string;
  confidence: number;
  description: string | null;
  reasoning: string | null;
  recommendations: string[] | null;
  created_at: string;
}

const Doctor = () => {
  const [selectedSubmission, setSelectedSubmission] = useState<PatientSubmission | null>(null);

  const { data: submissions = [], isLoading } = useQuery({
    queryKey: ['patient-submissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patient_submissions')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as PatientSubmission[];
    },
    refetchInterval: 10000,
  });

  const modelSpecs = [
    { label: "Architecture", value: "DenseNet-121 with Transfer Learning" },
    { label: "Input Size", value: "224 × 224 × 3 (RGB)" },
    { label: "Preprocessing", value: "Normalization (0-1), Resize" },
    { label: "Output Layer", value: "Softmax (10 classes)" },
    { label: "Framework", value: "TensorFlow / Keras" },
  ];

  const limitations = [
    "Predictions are based on visual patterns and may not capture all diagnostic criteria",
    "The model requires clear, well-lit images for optimal performance",
    "Rare skin conditions outside the 10 trained classes cannot be identified",
    "System cannot replace comprehensive dermatological examination",
    "Model performance may vary with different skin tones and lighting conditions",
    "Cannot detect multiple concurrent conditions in a single image"
  ];

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 85) return "text-success";
    if (confidence >= 70) return "text-primary";
    return "text-warning";
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-8 md:py-12">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center p-3 rounded-full bg-primary/10 mb-4">
              <Stethoscope className="h-8 w-8 text-primary" />
            </div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-3">
              Doctor Dashboard
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Review patient submissions, AI predictions, and manage skin disease analyses.
            </p>
          </div>

          <div className="max-w-5xl mx-auto space-y-8">
            {/* Patient Submissions Section */}
            <section className="bg-card rounded-2xl shadow-card p-6 md:p-8 border border-border/50">
              <h2 className="font-heading text-xl font-semibold text-foreground mb-6 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                Patient Submissions
                {submissions.length > 0 && (
                  <Badge variant="secondary" className="ml-2">{submissions.length}</Badge>
                )}
              </h2>

              {isLoading ? (
                <div className="text-center py-12 text-muted-foreground">Loading submissions...</div>
              ) : submissions.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">No patient submissions yet.</p>
                  <p className="text-sm text-muted-foreground mt-1">Submissions from the Patient Portal will appear here.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {submissions.map((sub) => (
                    <div
                      key={sub.id}
                      onClick={() => setSelectedSubmission(sub)}
                      className="flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary/30 hover:shadow-card transition-all cursor-pointer bg-background"
                    >
                      <img
                        src={sub.image_url}
                        alt="Patient skin"
                        className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-foreground">{sub.patient_name}</p>
                          <span className="text-xs text-muted-foreground">Age: {sub.patient_age}</span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {sub.days_suffering} day{sub.days_suffering !== 1 ? 's' : ''} suffering
                          </span>
                        </div>
                        <p className="text-sm font-medium text-primary mt-1">{sub.predicted_disease}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Calendar className="h-3 w-3" />
                          {new Date(sub.created_at).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className={`text-lg font-bold ${getConfidenceColor(sub.confidence)}`}>
                          {sub.confidence.toFixed(1)}%
                        </span>
                        <p className="text-xs text-muted-foreground">confidence</p>
                      </div>
                      <Eye className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Detail Dialog */}
            <Dialog open={!!selectedSubmission} onOpenChange={() => setSelectedSubmission(null)}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                {selectedSubmission && (
                  <>
                    <DialogHeader>
                      <DialogTitle className="font-heading text-xl">Patient Analysis Details</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6 mt-4">
                      {/* Patient Info */}
                      <div className="grid grid-cols-3 gap-4">
                        <div className="p-3 rounded-lg bg-muted/50 border border-border text-center">
                          <p className="text-xs text-muted-foreground mb-1">Patient</p>
                          <p className="font-semibold text-foreground text-sm">{selectedSubmission.patient_name}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-muted/50 border border-border text-center">
                          <p className="text-xs text-muted-foreground mb-1">Age</p>
                          <p className="font-semibold text-foreground text-sm">{selectedSubmission.patient_age} yrs</p>
                        </div>
                        <div className="p-3 rounded-lg bg-muted/50 border border-border text-center">
                          <p className="text-xs text-muted-foreground mb-1">Days Suffering</p>
                          <p className="font-semibold text-foreground text-sm">{selectedSubmission.days_suffering}</p>
                        </div>
                      </div>

                      {/* Image */}
                      <div className="text-center">
                        <img
                          src={selectedSubmission.image_url}
                          alt="Skin condition"
                          className="w-full max-h-64 object-contain rounded-xl border border-border"
                        />
                      </div>

                      {/* Prediction */}
                      <div>
                        <h3 className="font-heading font-semibold text-foreground mb-2">AI Prediction</h3>
                        <p className="text-lg font-bold text-primary">{selectedSubmission.predicted_disease}</p>
                        {selectedSubmission.description && (
                          <p className="text-sm text-muted-foreground mt-1">{selectedSubmission.description}</p>
                        )}
                        <div className="mt-3 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-foreground">Confidence</span>
                            <span className={`font-bold ${getConfidenceColor(selectedSubmission.confidence)}`}>
                              {selectedSubmission.confidence.toFixed(1)}%
                            </span>
                          </div>
                          <Progress value={selectedSubmission.confidence} className="h-2" />
                        </div>
                      </div>

                      {/* Reasoning */}
                      {selectedSubmission.reasoning && (
                        <div>
                          <h3 className="font-heading font-semibold text-foreground mb-2 flex items-center gap-2">
                            <Brain className="h-4 w-4 text-primary" />
                            AI Reasoning
                          </h3>
                          <p className="text-sm text-muted-foreground leading-relaxed">{selectedSubmission.reasoning}</p>
                        </div>
                      )}

                      {/* Recommendations */}
                      {selectedSubmission.recommendations && selectedSubmission.recommendations.length > 0 && (
                        <div>
                          <h3 className="font-heading font-semibold text-foreground mb-2 flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-success" />
                            Recommendations
                          </h3>
                          <ul className="space-y-1.5">
                            {selectedSubmission.recommendations.map((rec, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                <span className="w-1.5 h-1.5 rounded-full bg-success mt-1.5 flex-shrink-0" />
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <p className="text-xs text-muted-foreground text-center">
                        Submitted on {new Date(selectedSubmission.created_at).toLocaleString()}
                      </p>
                    </div>
                  </>
                )}
              </DialogContent>
            </Dialog>

            {/* Model Architecture Section */}
            <section className="bg-card rounded-2xl shadow-card p-6 md:p-8 border border-border/50">
              <h2 className="font-heading text-xl font-semibold text-foreground mb-6 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Brain className="h-5 w-5 text-primary" />
                </div>
                AI Model Architecture
              </h2>
              
              <p className="text-muted-foreground mb-6">
                This system employs a Convolutional Neural Network (CNN) based on DenseNet-121 
                architecture with transfer learning.
              </p>
              
              <div className="grid sm:grid-cols-2 gap-4">
                {modelSpecs.map((spec, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
                    <span className="text-sm font-medium text-foreground">{spec.label}</span>
                    <span className="text-sm text-muted-foreground text-right">{spec.value}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 rounded-lg bg-secondary/30 border border-secondary">
                <h3 className="font-medium text-secondary-foreground flex items-center gap-2 mb-2">
                  <BookOpen className="h-4 w-4" />
                  How Transfer Learning Works
                </h3>
                <p className="text-sm text-muted-foreground">
                  Transfer learning leverages knowledge from a model trained on a large dataset (ImageNet) 
                  and applies it to a specialized task. DenseNet-121's dense connections enable feature reuse, 
                  making it highly effective for medical image classification with limited training data.
                </p>
              </div>
            </section>

            {/* Supported Diseases Section */}
            <section className="bg-card rounded-2xl shadow-card p-6 md:p-8 border border-border/50">
              <h2 className="font-heading text-xl font-semibold text-foreground mb-6 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Layers className="h-5 w-5 text-primary" />
                </div>
                Supported Skin Diseases (10 Classes)
              </h2>
              
              <Accordion type="single" collapsible className="w-full">
                {SKIN_DISEASES.map((disease, index) => (
                  <AccordionItem key={index} value={`disease-${index}`}>
                    <AccordionTrigger className="hover:no-underline">
                      <span className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                          {index + 1}
                        </span>
                        {disease.name}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="pl-9 space-y-4">
                        <p className="text-muted-foreground">{disease.description}</p>
                        
                        <div>
                          <h4 className="text-sm font-medium text-foreground mb-2">Common Symptoms:</h4>
                          <div className="flex flex-wrap gap-2">
                            {disease.symptoms.map((symptom, i) => (
                              <span key={i} className="px-2 py-1 text-xs rounded-full bg-muted text-muted-foreground">
                                {symptom}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-foreground mb-2">General Treatment Approaches:</h4>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {disease.commonTreatments.map((treatment, i) => (
                              <li key={i} className="flex items-center gap-2">
                                <CheckCircle className="h-3 w-3 text-success flex-shrink-0" />
                                {treatment}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>

            {/* Limitations Section */}
            <section className="bg-card rounded-2xl shadow-card p-6 md:p-8 border border-border/50">
              <h2 className="font-heading text-xl font-semibold text-foreground mb-6 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-warning/10">
                  <AlertCircle className="h-5 w-5 text-warning" />
                </div>
                System Limitations
              </h2>
              
              <ul className="space-y-3">
                {limitations.map((limitation, index) => (
                  <li key={index} className="flex items-start gap-3 text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-warning mt-2 flex-shrink-0" />
                    {limitation}
                  </li>
                ))}
              </ul>
            </section>

            {/* Disclaimer */}
            <MedicalDisclaimer />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Doctor;
