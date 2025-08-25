import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import ToolSection from "@/components/ToolSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <ToolSection />
        <FeaturesSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
