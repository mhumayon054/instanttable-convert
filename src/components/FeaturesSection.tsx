import { CheckCircle, Zap, Shield, Smartphone, UserCheck, Headphones } from "lucide-react";

const features = [
  {
    icon: CheckCircle,
    title: "Easy to Use",
    description: "Simple interface that anyone can master in seconds. Just paste your HTML table and click convert."
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Instant conversion with optimized processing. No waiting, no delays - get your CSV immediately."
  },
  {
    icon: Shield,
    title: "100% Secure",
    description: "Your data never leaves your browser. All processing happens locally for maximum privacy and security."
  },
  {
    icon: Smartphone,
    title: "Fully Responsive",
    description: "Works perfectly on desktop, tablet, and mobile devices. Convert tables anywhere, anytime."
  },
  {
    icon: UserCheck,
    title: "No Signup Required",
    description: "Start converting immediately without creating accounts or providing personal information."
  },
  {
    icon: Headphones,
    title: "Premium Support",
    description: "Get priority assistance and advanced features with our premium plan for power users."
  }
];

const FeaturesSection = () => {
  return (
    <section id="features" className="bg-gradient-section py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Why Choose Table2CSV Pro?
          </h2>
          <p className="text-lg text-foreground-muted max-w-2xl mx-auto">
            Packed with features that make table conversion effortless and reliable for everyone.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div key={index} className="feature-card group">
                <div className="w-12 h-12 bg-primary-blue/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary-blue/20 transition-colors">
                  <IconComponent className="w-6 h-6 text-primary-blue" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
                <p className="text-foreground-muted leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;