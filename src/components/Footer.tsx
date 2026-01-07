import { Heart, GraduationCap } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground text-primary-foreground py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm">
            <GraduationCap className="h-5 w-5" />
            <span className="font-medium">B.Tech Final Year Project</span>
          </div>
          
          <div className="text-center text-sm opacity-80">
            <p>Enhanced Skin Disease Detection Using Deep Learning</p>
            <p className="text-xs mt-1 opacity-60">
              © 2024 - For Educational & Research Purposes Only
            </p>
          </div>
          
          <div className="flex items-center gap-1 text-sm">
            <span>Made with</span>
            <Heart className="h-4 w-4 text-destructive fill-destructive" />
            <span>for healthcare innovation</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
