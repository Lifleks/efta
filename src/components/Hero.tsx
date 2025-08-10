import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import MusicPlayer from "@/components/MusicPlayer";
import UserMenu from "@/components/UserMenu";
import { useAuth } from "@/hooks/useAuth";
import heroImage from "@/assets/gothic-hero-bg.jpg";

const Hero = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-gothic overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      
      {/* Gothic Glow Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gothic-glow/10 rounded-full blur-3xl animate-gothic-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gothic-glow/5 rounded-full blur-3xl animate-float" />
      
      {/* User Menu */}
      {user && (
        <div className="absolute top-6 right-6 z-30">
          <div className="profile-glow rounded-lg">
            <UserMenu />
          </div>
        </div>
      )}
      
      {/* Main Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <div className="animate-fade-in-up">
          <h1 className="text-6xl md:text-8xl font-bold text-gothic-highlight mb-6 leading-tight">
            EFTANASYA
          </h1>
          <div className="w-32 h-1 bg-gradient-glow mx-auto mb-8" />
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Твой путь в мир много уровня, где цифровизация пожирает метастазы сознания людей
          </p>
          <p className="text-lg text-gothic-accent mb-12 max-w-2xl mx-auto">
            Погрузись в бездну звука. Исследуй темные глубины музыки. Откройся ритмам подсознания.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
            <Button 
              variant="hero" 
              size="lg" 
              className="text-lg px-12 py-4"
              onClick={() => navigate('/auth')}
            >
              Войти в бездну
            </Button>
            <Button 
              variant="gothic" 
              size="lg" 
              className="text-lg px-12 py-4"
              onClick={() => navigate('/gallery')}
            >
              Исследовать галерею
            </Button>
          </div>

          {/* Music Player */}
          <div className="mt-16">
            <MusicPlayer />
          </div>
        </div>
      </div>
      
      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default Hero;