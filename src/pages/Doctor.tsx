import { Stethoscope, Brain, Layers, AlertCircle, CheckCircle, BookOpen } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MedicalDisclaimer from "@/components/MedicalDisclaimer";
import { SKIN_DISEASES } from "@/lib/skinDiseaseService";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const Doctor = () => {
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
              Educational overview of the AI-based skin disease detection system, 
              including technical specifications, supported conditions, and system limitations.
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-8">
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
                architecture with transfer learning. The model is pre-trained on ImageNet and 
                fine-tuned for skin disease classification.
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
