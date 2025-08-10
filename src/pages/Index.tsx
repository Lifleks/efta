import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Philosophy from "@/components/Philosophy";
import SignupForm from "@/components/SignupForm";
import Testimonials from "@/components/Testimonials";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import Preloader from "@/components/Preloader";
import RecentTracks from "@/components/RecentTracks";
import TrackRecommendations from "@/components/TrackRecommendations";

const Index = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  if (isLoading) {
    return <Preloader onComplete={handleLoadingComplete} />;
  }

  return (
    <div className="min-h-screen bg-background font-gothic pb-24">
      <div className="flex">
        {/* Main Content */}
        <div className={`flex-1 ${user ? 'lg:pr-80' : ''}`}>
          <Hero />
          <Features />
          <Philosophy />
          <SignupForm />
          <Testimonials />
          <FAQ />
          <TrackRecommendations />
          <Footer />
        </div>
        
        {/* Sidebar with Recent Tracks */}
        {user && (
          <div className="hidden lg:block fixed right-0 top-0 w-80 h-screen overflow-y-auto bg-background/95 backdrop-blur border-l border-primary/20 p-6">
            <div className="pt-24">
              <RecentTracks />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;