import { Link } from "react-router-dom";
import { ArrowRight, Brain, Shield, Zap, Users, Microscope, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MedicalDisclaimer from "@/components/MedicalDisclaimer";
import FeatureCard from "@/components/FeatureCard";

const Index = () => {
  const features = [
    {
      icon: Brain,
      title: "Deep Learning Powered",
      description: "Utilizes DenseNet-121 CNN architecture with transfer learning for accurate skin disease classification."
    },
    {
      icon: Zap,
      title: "Instant Analysis",
      description: "Get prediction results within seconds after uploading your skin image for analysis."
    },
    {
      icon: Shield,
      title: "10 Disease Classes",
      description: "Trained to identify 10 common skin conditions including Melanoma, Psoriasis, Eczema, and more."
    },
    {
      icon: Microscope,
      title: "Research-Grade",
      description: "Built using industry-standard deep learning frameworks and medical imaging best practices."
    },
    {
      icon: Users,
      title: "User-Friendly",
      description: "Simple interface designed for both patients seeking quick analysis and healthcare professionals."
    },
    {
      icon: Award,
      title: "Academic Project",
      description: "Developed as a B.Tech final year project demonstrating practical AI applications in healthcare."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 hero-gradient opacity-95" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.03%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50" />
          
          <div className="relative container mx-auto px-4 py-20 md:py-32">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 mb-6 animate-fade-in">
                <Brain className="h-4 w-4 text-secondary" />
                <span className="text-sm font-medium text-primary-foreground">
                  AI-Powered Medical Diagnosis System
                </span>
              </div>
              
              <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6 animate-slide-up">
                Enhanced Skin Disease Detection Using{" "}
                <span className="text-secondary">Deep Learning</span>
              </h1>
              
              <p className="text-lg md:text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: "0.1s" }}>
                An intelligent medical decision support system that classifies skin diseases 
                from uploaded images using advanced Convolutional Neural Networks.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: "0.2s" }}>
                <Button asChild size="lg" className="bg-primary-foreground text-foreground hover:bg-primary-foreground/90 font-semibold px-8">
                  <Link to="/patient">
                    Start Analysis
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                  <Link to="/doctor">
                    Doctor Dashboard
                  </Link>
                </Button>
              </div>
            </div>
          </div>
          
          {/* Wave decoration */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 50L48 45.7C96 41 192 33 288 35.3C384 38 480 52 576 55.2C672 58 768 52 864 48.5C960 45 1056 45 1152 50.2C1248 55 1344 65 1392 70L1440 75V100H1392C1344 100 1248 100 1152 100C1056 100 960 100 864 100C768 100 672 100 576 100C480 100 384 100 288 100C192 100 96 100 48 100H0V50Z" fill="hsl(var(--background))"/>
            </svg>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
                How It Works
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our system leverages state-of-the-art deep learning techniques to provide 
                accurate skin disease predictions for educational and research purposes.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <div key={index} className="animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                  <FeatureCard {...feature} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Disclaimer Section */}
        <section className="py-12 bg-muted/50">
          <div className="container mx-auto px-4 max-w-3xl">
            <MedicalDisclaimer />
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center p-8 md:p-12 rounded-2xl medical-gradient shadow-xl">
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-primary-foreground mb-4">
                Ready to Try the AI Diagnosis System?
              </h2>
              <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
                Upload a skin image and receive instant AI-powered predictions. 
                Remember, this is for educational demonstration only.
              </p>
              <Button asChild size="lg" className="bg-primary-foreground text-foreground hover:bg-primary-foreground/90 font-semibold px-8">
                <Link to="/patient">
                  Upload Image Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
