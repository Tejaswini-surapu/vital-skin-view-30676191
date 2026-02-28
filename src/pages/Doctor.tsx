import { useState } from "react";
import { Stethoscope, Brain, Layers, AlertCircle, CheckCircle, BookOpen, Users, Calendar, Clock, Eye, Search, Trash2, X } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MedicalDisclaimer from "@/components/MedicalDisclaimer";
import { SKIN_DISEASES } from "@/lib/skinDiseaseService";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface ModelResult {
  modelName: string;
  modelDescription: string;
  disease: string;
  confidence: number;
  reasoning: string;
  recommendations: string[];
}

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
  mobile_number: string | null;
  address: string | null;
  token_number: string | null;
  entered_by: string | null;
  cause: string | null;
  model_results: ModelResult[] | null;
}

const Doctor = () => {
  const [selectedSubmission, setSelectedSubmission] = useState<PatientSubmission | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [diseaseFilter, setDiseaseFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: submissions = [], isLoading } = useQuery({
    queryKey: ['patient-submissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patient_submissions')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as unknown as PatientSubmission[];
    },
    refetchInterval: 10000,
  });

  const filteredSubmissions = submissions.filter(sub => {
    const matchSearch = !searchQuery ||
      sub.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.predicted_disease.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.token_number?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchDisease = diseaseFilter === "all" || sub.predicted_disease === diseaseFilter;

    let matchDate = true;
    if (dateFilter !== "all") {
      const subDate = new Date(sub.created_at);
      const now = new Date();
      if (dateFilter === "today") {
        matchDate = subDate.toDateString() === now.toDateString();
      } else if (dateFilter === "week") {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        matchDate = subDate >= weekAgo;
      } else if (dateFilter === "month") {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        matchDate = subDate >= monthAgo;
      }
    }

    return matchSearch && matchDisease && matchDate;
  });

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const { error } = await supabase.from('patient_submissions').delete().eq('id', id);
    if (error) {
      toast({ variant: "destructive", title: "Delete Failed", description: error.message });
    } else {
      toast({ title: "Deleted", description: "Patient record removed." });
      queryClient.invalidateQueries({ queryKey: ['patient-submissions'] });
    }
  };

  const handleClearAll = async () => {
    if (!confirm("Are you sure you want to delete ALL patient records? This cannot be undone.")) return;
    const { error } = await supabase.from('patient_submissions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (error) {
      toast({ variant: "destructive", title: "Clear Failed", description: error.message });
    } else {
      toast({ title: "Cleared", description: "All patient records removed." });
      queryClient.invalidateQueries({ queryKey: ['patient-submissions'] });
    }
  };

  const uniqueDiseases = [...new Set(submissions.map(s => s.predicted_disease))];

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 85) return "text-green-600";
    if (confidence >= 70) return "text-primary";
    return "text-yellow-600";
  };

  const modelArchitectures = [
    {
      name: "DenseNet-121",
      type: "CNN",
      description: "Convolutional Neural Network with dense connections enabling feature reuse across layers.",
      specs: [
        { label: "Architecture", value: "DenseNet-121 with Transfer Learning" },
        { label: "Input Size", value: "224 × 224 × 3 (RGB)" },
        { label: "Strength", value: "Efficient feature reuse, fewer parameters" },
      ]
    },
    {
      name: "Vision Transformer (ViT)",
      type: "Transformer",
      description: "Applies self-attention mechanisms on image patches for global context understanding.",
      specs: [
        { label: "Architecture", value: "ViT-Base/16 with patch embedding" },
        { label: "Input Size", value: "224 × 224 (16×16 patches)" },
        { label: "Strength", value: "Global context, long-range dependencies" },
      ]
    },
    {
      name: "Swin Transformer",
      type: "Hierarchical Transformer",
      description: "Hierarchical vision transformer with shifted window attention for multi-scale feature extraction.",
      specs: [
        { label: "Architecture", value: "Swin-T with shifted windows" },
        { label: "Input Size", value: "224 × 224 (7×7 windows)" },
        { label: "Strength", value: "Multi-scale features, fine-grained details" },
      ]
    }
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
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center p-3 rounded-full bg-primary/10 mb-4">
              <Stethoscope className="h-8 w-8 text-primary" />
            </div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-3">Doctor Dashboard</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Review patient submissions, AI predictions, and manage skin disease analyses.
            </p>
          </div>

          <div className="max-w-5xl mx-auto space-y-8">
            {/* Patient Submissions */}
            <section className="bg-card rounded-2xl shadow-card p-6 md:p-8 border border-border/50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h2 className="font-heading text-xl font-semibold text-foreground flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10"><Users className="h-5 w-5 text-primary" /></div>
                  Patient Submissions
                  {submissions.length > 0 && <Badge variant="secondary">{filteredSubmissions.length}/{submissions.length}</Badge>}
                </h2>
                {submissions.length > 0 && (
                  <Button variant="destructive" size="sm" onClick={handleClearAll}>
                    <Trash2 className="h-4 w-4 mr-1" /> Clear All
                  </Button>
                )}
              </div>

              {/* Filters */}
              {submissions.length > 0 && (
                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search name, disease, token..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
                  </div>
                  <Select value={diseaseFilter} onValueChange={setDiseaseFilter}>
                    <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="Filter disease" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Diseases</SelectItem>
                      {uniqueDiseases.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Filter date" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">Last 7 Days</SelectItem>
                      <SelectItem value="month">Last 30 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {isLoading ? (
                <div className="text-center py-12 text-muted-foreground">Loading submissions...</div>
              ) : filteredSubmissions.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">{submissions.length === 0 ? "No patient submissions yet." : "No results match your filters."}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredSubmissions.map((sub) => (
                    <div key={sub.id} onClick={() => setSelectedSubmission(sub)}
                      className="flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary/30 hover:shadow-card transition-all cursor-pointer bg-background">
                      <img src={sub.image_url} alt="Patient skin" className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-foreground">{sub.patient_name}</p>
                          <span className="text-xs text-muted-foreground">Age: {sub.patient_age}</span>
                          {sub.token_number && <Badge variant="outline" className="text-xs">{sub.token_number}</Badge>}
                          {sub.entered_by && <Badge variant="secondary" className="text-xs">{sub.entered_by}</Badge>}
                        </div>
                        <p className="text-sm font-medium text-primary mt-1">{sub.predicted_disease}</p>
                        <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                          {sub.cause && <span className="text-xs text-muted-foreground">Cause: {sub.cause}</span>}
                          <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" />{sub.days_suffering}d</span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(sub.created_at).toLocaleDateString('en-US', { dateStyle: 'medium' })}</span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className={`text-lg font-bold ${getConfidenceColor(sub.confidence)}`}>{sub.confidence.toFixed(1)}%</span>
                        <p className="text-xs text-muted-foreground">confidence</p>
                      </div>
                      <Button variant="ghost" size="icon" className="flex-shrink-0 text-destructive hover:text-destructive" onClick={(e) => handleDelete(sub.id, e)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
                      {/* Patient Info Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {[
                          { label: "Patient", value: selectedSubmission.patient_name },
                          { label: "Age", value: `${selectedSubmission.patient_age} yrs` },
                          { label: "Days Suffering", value: String(selectedSubmission.days_suffering) },
                          ...(selectedSubmission.mobile_number ? [{ label: "Mobile", value: selectedSubmission.mobile_number }] : []),
                          ...(selectedSubmission.token_number ? [{ label: "Token", value: selectedSubmission.token_number }] : []),
                          ...(selectedSubmission.entered_by ? [{ label: "Entered By", value: selectedSubmission.entered_by }] : []),
                          ...(selectedSubmission.cause ? [{ label: "Cause", value: selectedSubmission.cause }] : []),
                        ].map((item, i) => (
                          <div key={i} className="p-3 rounded-lg bg-muted/50 border border-border text-center">
                            <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
                            <p className="font-semibold text-foreground text-sm">{item.value}</p>
                          </div>
                        ))}
                      </div>

                      {selectedSubmission.address && (
                        <div className="p-3 rounded-lg bg-muted/50 border border-border">
                          <p className="text-xs text-muted-foreground mb-1">Address</p>
                          <p className="text-sm text-foreground">{selectedSubmission.address}</p>
                        </div>
                      )}

                      <div className="text-center">
                        <img src={selectedSubmission.image_url} alt="Skin condition" className="w-full max-h-64 object-contain rounded-xl border border-border" />
                      </div>

                      {/* Best Prediction */}
                      <div>
                        <h3 className="font-heading font-semibold text-foreground mb-2">Best AI Prediction</h3>
                        <p className="text-lg font-bold text-primary">{selectedSubmission.predicted_disease}</p>
                        {selectedSubmission.description && <p className="text-sm text-muted-foreground mt-1">{selectedSubmission.description}</p>}
                        <div className="mt-3 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-foreground">Confidence</span>
                            <span className={`font-bold ${getConfidenceColor(selectedSubmission.confidence)}`}>{selectedSubmission.confidence.toFixed(1)}%</span>
                          </div>
                          <Progress value={selectedSubmission.confidence} className="h-2" />
                        </div>
                      </div>

                      {/* Multi-Model Comparison */}
                      {selectedSubmission.model_results && selectedSubmission.model_results.length > 0 && (
                        <div>
                          <h3 className="font-heading font-semibold text-foreground mb-3 flex items-center gap-2">
                            <Brain className="h-4 w-4 text-primary" />
                            Multi-Model Comparison
                          </h3>
                          <div className="space-y-3">
                            {selectedSubmission.model_results
                              .sort((a, b) => b.confidence - a.confidence)
                              .map((mr, i) => (
                                <div key={i} className={`p-4 rounded-lg border ${i === 0 ? 'border-primary bg-primary/5' : 'border-border bg-muted/30'}`}>
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <span className="font-semibold text-sm text-foreground">{mr.modelName}</span>
                                      {i === 0 && <Badge className="text-xs">Highest Accuracy</Badge>}
                                    </div>
                                    <span className={`font-bold ${getConfidenceColor(mr.confidence)}`}>{mr.confidence.toFixed(1)}%</span>
                                  </div>
                                  <p className="text-xs text-muted-foreground mb-1">{mr.modelDescription}</p>
                                  <p className="text-sm text-primary font-medium">{mr.disease}</p>
                                  <Progress value={mr.confidence} className="h-1.5 mt-2" />
                                  {mr.reasoning && <p className="text-xs text-muted-foreground mt-2">{mr.reasoning}</p>}
                                </div>
                              ))}
                          </div>
                        </div>
                      )}

                      {selectedSubmission.reasoning && (
                        <div>
                          <h3 className="font-heading font-semibold text-foreground mb-2 flex items-center gap-2">
                            <Brain className="h-4 w-4 text-primary" /> AI Reasoning
                          </h3>
                          <p className="text-sm text-muted-foreground leading-relaxed">{selectedSubmission.reasoning}</p>
                        </div>
                      )}

                      {selectedSubmission.recommendations && selectedSubmission.recommendations.length > 0 && (
                        <div>
                          <h3 className="font-heading font-semibold text-foreground mb-2 flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" /> Recommendations
                          </h3>
                          <ul className="space-y-1.5">
                            {selectedSubmission.recommendations.map((rec, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-600 mt-1.5 flex-shrink-0" />{rec}
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
                <div className="p-2 rounded-lg bg-primary/10"><Brain className="h-5 w-5 text-primary" /></div>
                AI Model Architectures (3 Models)
              </h2>

              <div className="space-y-6">
                {modelArchitectures.map((model, idx) => (
                  <div key={idx} className="p-5 rounded-xl border border-border bg-muted/20">
                    <div className="flex items-center gap-3 mb-3">
                      <Badge variant="secondary">{model.type}</Badge>
                      <h3 className="font-heading font-semibold text-foreground">{model.name}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">{model.description}</p>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {model.specs.map((spec, i) => (
                        <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-background border border-border">
                          <span className="text-xs font-medium text-foreground">{spec.label}</span>
                          <span className="text-xs text-muted-foreground text-right">{spec.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 rounded-lg bg-secondary/30 border border-secondary">
                <h3 className="font-medium text-secondary-foreground flex items-center gap-2 mb-2">
                  <BookOpen className="h-4 w-4" /> How Multi-Model Analysis Works
                </h3>
                <p className="text-sm text-muted-foreground">
                  Each uploaded image is analyzed by all three models simultaneously. The system compares their predictions
                  and selects the result with the highest confidence score as the primary diagnosis. This ensemble approach
                  increases reliability and reduces the chance of misclassification.
                </p>
              </div>
            </section>

            {/* Supported Diseases */}
            <section className="bg-card rounded-2xl shadow-card p-6 md:p-8 border border-border/50">
              <h2 className="font-heading text-xl font-semibold text-foreground mb-6 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10"><Layers className="h-5 w-5 text-primary" /></div>
                Supported Skin Diseases (10 Classes)
              </h2>
              <Accordion type="single" collapsible className="w-full">
                {SKIN_DISEASES.map((disease, index) => (
                  <AccordionItem key={index} value={`disease-${index}`}>
                    <AccordionTrigger className="hover:no-underline">
                      <span className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">{index + 1}</span>
                        {disease.name}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="pl-9 space-y-4">
                        <p className="text-muted-foreground">{disease.description}</p>
                        <div>
                          <h4 className="text-sm font-medium text-foreground mb-2">Common Symptoms:</h4>
                          <div className="flex flex-wrap gap-2">
                            {disease.symptoms.map((s, i) => (
                              <span key={i} className="px-2 py-1 text-xs rounded-full bg-muted text-muted-foreground">{s}</span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-foreground mb-2">General Treatment Approaches:</h4>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {disease.commonTreatments.map((t, i) => (
                              <li key={i} className="flex items-center gap-2">
                                <CheckCircle className="h-3 w-3 text-green-600 flex-shrink-0" />{t}
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

            {/* Limitations */}
            <section className="bg-card rounded-2xl shadow-card p-6 md:p-8 border border-border/50">
              <h2 className="font-heading text-xl font-semibold text-foreground mb-6 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-500/10"><AlertCircle className="h-5 w-5 text-yellow-600" /></div>
                System Limitations
              </h2>
              <ul className="space-y-3">
                {limitations.map((l, i) => (
                  <li key={i} className="flex items-start gap-3 text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-2 flex-shrink-0" />{l}
                  </li>
                ))}
              </ul>
            </section>

            <MedicalDisclaimer />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Doctor;
