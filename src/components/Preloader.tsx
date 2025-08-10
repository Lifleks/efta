import { useEffect, useState } from "react";

const Preloader = ({ onComplete }: { onComplete: () => void }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 500); // Задержка перед исчезновением
          return 100;
        }
        return prev + Math.random() * 15 + 5; // Случайный прирост от 5 до 20
      });
    }, 100);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-background flex items-center justify-center">
      {/* Gothic Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gothic-glow/20 rounded-full blur-3xl animate-gothic-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gothic-glow/10 rounded-full blur-3xl animate-float" />
      </div>

      <div className="relative z-10 text-center">
        {/* Rotating Logo */}
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto relative">
            <div className="absolute inset-0 border-4 border-gothic-accent rounded-full animate-spin">
              <div className="absolute top-0 left-1/2 w-2 h-2 bg-gothic-glow rounded-full transform -translate-x-1/2 -translate-y-1"></div>
            </div>
            <div className="absolute inset-2 border-2 border-gothic-glow/50 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '3s' }}>
              <div className="absolute bottom-0 right-1/2 w-1 h-1 bg-gothic-accent rounded-full transform translate-x-1/2 translate-y-1"></div>
            </div>
            <div className="absolute inset-6 bg-gothic-highlight/20 rounded-full flex items-center justify-center">
              <span className="text-gothic-highlight font-bold text-xl">E</span>
            </div>
          </div>
        </div>

        {/* Brand Name */}
        <h1 className="text-4xl font-bold text-gothic-highlight mb-8 animate-gothic-glow">
          EFTANASYA
        </h1>

        {/* Progress Bar */}
        <div className="w-80 mx-auto">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Погружение в бездну...</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gothic-accent/30 rounded-full h-1">
            <div 
              className="bg-gradient-to-r from-gothic-glow to-gothic-highlight h-1 rounded-full transition-all duration-300 shadow-glow"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>

        {/* Loading Text */}
        <p className="text-muted-foreground mt-6 animate-pulse">
          Инициализация портала в другие измерения...
        </p>
      </div>
    </div>
  );
};

export default Preloader;