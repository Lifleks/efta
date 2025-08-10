import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Music, CheckCircle, ArrowRight } from "lucide-react";
import { toast } from "sonner";

interface Artist {
  name: string;
  genre: string;
  description: string;
}

interface RecommendationSetupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

const INITIAL_ARTISTS: Artist[] = [
  { name: "Кишлак", genre: "Рэп", description: "Русский рэп, лирика" },
  { name: "Oxxxymiron", genre: "Рэп", description: "Интеллектуальный рэп" },
  { name: "Скриптонит", genre: "Хип-хоп", description: "Казахстанский хип-хоп" },
  { name: "Face", genre: "Клауд-рэп", description: "Мелодичный рэп" },
  { name: "Miyagi & Andy Panda", genre: "Хип-хоп", description: "Позитивный хип-хоп" },
  { name: "ЛСП", genre: "Инди-рэп", description: "Альтернативный рэп" },
  { name: "Каста", genre: "Рэп", description: "Классический русский рэп" },
  { name: "Баста", genre: "Рэп", description: "Популярный русский рэп" },
  { name: "T-Fest", genre: "Трэп", description: "Современный трэп" },
  { name: "Pharaoh", genre: "Клауд-рэп", description: "Эмоциональный рэп" },
  { name: "MORGENSHTERN", genre: "Трэп", description: "Коммерческий трэп" },
  { name: "Элджей", genre: "Поп-рэп", description: "Мелодичный поп-рэп" }
];

const SIMILAR_ARTISTS: Record<string, Artist[]> = {
  "Кишлак": [
    { name: "Слава КПСС", genre: "Рэп", description: "Экспериментальный рэп" },
    { name: "Сд", genre: "Рэп", description: "Лирический рэп" },
    { name: "Boulevard Depo", genre: "Рэп", description: "Альтернативный рэп" }
  ],
  "Oxxxymiron": [
    { name: "Noize MC", genre: "Рэп-рок", description: "Социальный рэп" },
    { name: "Соня Мармеладова", genre: "Рэп", description: "Женский рэп" },
    { name: "ATL", genre: "Рэп", description: "Групповой рэп" }
  ],
  "Скриптонит": [
    { name: "104", genre: "Хип-хоп", description: "Казахстанский рэп" },
    { name: "Truwer", genre: "Хип-хоп", description: "Мелодичный хип-хоп" },
    { name: "Jah Khalib", genre: "R&B", description: "R&B с рэпом" }
  ]
  // Добавьте больше связок по мере необходимости
};

const RecommendationSetup = ({ open, onOpenChange, onComplete }: RecommendationSetupProps) => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [selectedArtists, setSelectedArtists] = useState<string[]>([]);
  const [recommendedArtists, setRecommendedArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(false);

  const maxSteps = 2;
  const progress = (step / maxSteps) * 100;

  useEffect(() => {
    if (step === 2 && selectedArtists.length > 0) {
      generateRecommendations();
    }
  }, [step, selectedArtists]);

  const generateRecommendations = () => {
    const recommendations: Artist[] = [];
    
    selectedArtists.forEach(artistName => {
      const similar = SIMILAR_ARTISTS[artistName] || [];
      recommendations.push(...similar);
    });

    // Убираем дубликаты и уже выбранных артистов
    const uniqueRecommendations = recommendations.filter((artist, index, self) => 
      index === self.findIndex(a => a.name === artist.name) &&
      !selectedArtists.includes(artist.name)
    );

    setRecommendedArtists(uniqueRecommendations);
  };

  const toggleArtist = (artistName: string) => {
    setSelectedArtists(prev => 
      prev.includes(artistName) 
        ? prev.filter(name => name !== artistName)
        : [...prev, artistName]
    );
  };

  const handleNext = () => {
    if (step === 1 && selectedArtists.length === 0) {
      toast.error("Выберите хотя бы одного артиста");
      return;
    }
    setStep(step + 1);
  };

  const handleFinish = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Сохраняем предпочтения пользователя
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          preferred_artists: selectedArtists,
          is_configured: true,
          configured_at: new Date().toISOString()
        });

      if (error) throw error;

      toast.success("Рекомендации настроены!");
      onComplete();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error("Ошибка при сохранении настроек");
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div>
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Выберите любимых артистов</h3>
        <p className="text-muted-foreground">
          Выберите артистов, которые вам нравятся. Мы подберем похожих исполнителей.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
        {INITIAL_ARTISTS.map((artist) => (
          <Card 
            key={artist.name}
            className={`cursor-pointer transition-all ${
              selectedArtists.includes(artist.name) 
                ? 'ring-2 ring-primary bg-accent' 
                : 'hover:bg-accent/50'
            }`}
            onClick={() => toggleArtist(artist.name)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-medium">{artist.name}</h4>
                  <Badge variant="secondary" className="text-xs mt-1">
                    {artist.genre}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">{artist.description}</p>
                </div>
                {selectedArtists.includes(artist.name) && (
                  <CheckCircle className="w-5 h-5 text-primary" />
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-between mt-6">
        <p className="text-sm text-muted-foreground">
          Выбрано: {selectedArtists.length} артистов
        </p>
        <Button onClick={handleNext} disabled={selectedArtists.length === 0}>
          Далее <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div>
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Рекомендуемые артисты</h3>
        <p className="text-muted-foreground">
          На основе ваших предпочтений мы подобрали похожих артистов. Выберите тех, кто вам интересен.
        </p>
      </div>

      {recommendedArtists.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
          {recommendedArtists.map((artist) => (
            <Card 
              key={artist.name}
              className={`cursor-pointer transition-all ${
                selectedArtists.includes(artist.name) 
                  ? 'ring-2 ring-primary bg-accent' 
                  : 'hover:bg-accent/50'
              }`}
              onClick={() => toggleArtist(artist.name)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium">{artist.name}</h4>
                    <Badge variant="secondary" className="text-xs mt-1">
                      {artist.genre}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">{artist.description}</p>
                  </div>
                  {selectedArtists.includes(artist.name) && (
                    <CheckCircle className="w-5 h-5 text-primary" />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Music className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            На основе ваших выборов пока нет рекомендаций
          </p>
        </div>
      )}

      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={() => setStep(1)}>
          Назад
        </Button>
        <Button onClick={handleFinish} disabled={loading}>
          {loading ? "Сохранение..." : "Завершить настройку"}
        </Button>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Music className="w-6 h-6" />
            Настройка рекомендаций
          </DialogTitle>
          <DialogDescription>
            Шаг {step} из {maxSteps}
          </DialogDescription>
        </DialogHeader>

        <div className="mb-4">
          <Progress value={progress} className="w-full" />
        </div>

        <div className="flex-1 overflow-y-auto">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RecommendationSetup;