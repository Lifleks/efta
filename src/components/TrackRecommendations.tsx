import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Star, TrendingUp } from "lucide-react";
import { usePlayer } from "@/contexts/PlayerContext";

interface RecommendedTrack {
  id: string;
  video_id: string;
  title: string;
  artist: string;
  thumbnail_url: string;
  reason: string;
}

export default function TrackRecommendations() {
  const { user } = useAuth();
  const { playTrack } = usePlayer();
  const [recommendations, setRecommendations] = useState<RecommendedTrack[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasPreferences, setHasPreferences] = useState(false);

  useEffect(() => {
    if (user) {
      checkUserPreferences();
    }
  }, [user]);

  const checkUserPreferences = async () => {
    if (!user) return;
    
    try {
      const { data: preferences } = await supabase
        .from('user_preferences')
        .select('preferred_artists')
        .eq('user_id', user.id)
        .single();

      if (preferences && preferences.preferred_artists && Array.isArray(preferences.preferred_artists) && preferences.preferred_artists.length > 0) {
        setHasPreferences(true);
        loadPersonalizedRecommendations(preferences.preferred_artists as string[]);
      } else {
        setHasPreferences(false);
      }
    } catch (error) {
      console.error('Error checking preferences:', error);
      setHasPreferences(false);
    }
  };

  const loadPersonalizedRecommendations = async (preferredArtists: string[]) => {
    setLoading(true);
    try {
      // Ищем треки из истории прослушивания и библиотеки пользователя
      const { data: historyTracks } = await supabase
        .from('listening_history')
        .select('video_id, title, artist, thumbnail_url')
        .eq('user_id', user.id)
        .in('artist', preferredArtists)
        .limit(20);

      const { data: libraryTracks } = await supabase
        .from('user_library')
        .select('video_id, title, artist, thumbnail_url')
        .eq('user_id', user.id)
        .in('artist', preferredArtists)
        .limit(20);

      // Объединяем и убираем дубликаты
      const allTracks = [...(historyTracks || []), ...(libraryTracks || [])];
      const uniqueTracks = allTracks.reduce((acc, track) => {
        if (!acc.find(t => t.video_id === track.video_id)) {
          acc.push(track);
        }
        return acc;
      }, [] as any[]);

      // Создаем рекомендации на основе предпочтений
      const personalizedRecommendations: RecommendedTrack[] = uniqueTracks
        .slice(0, 6)
        .map((track, index) => ({
          id: `personal_${index}`,
          video_id: track.video_id,
          title: track.title,
          artist: track.artist,
          thumbnail_url: track.thumbnail_url || '/placeholder.svg',
          reason: `Основано на ваших предпочтениях: ${track.artist}`
        }));

      setRecommendations(personalizedRecommendations);
    } catch (error) {
      console.error('Error loading recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayTrack = (track: RecommendedTrack) => {
    playTrack({
      videoId: track.video_id,
      title: track.title,
      artist: track.artist,
      thumbnail: track.thumbnail_url
    });
  };

  if (!user || !hasPreferences) {
    return null;
  }

  if (loading) {
    return (
      <Card className="bg-card/50 backdrop-blur border-primary/20 animate-pulse">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gothic-highlight">
            <Star className="w-5 h-5" />
            Рекомендации для вас
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">Загрузка персональных рекомендаций...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-b from-background to-background/95">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gothic-highlight mb-4 flex items-center justify-center gap-3">
            <TrendingUp className="w-8 h-8" />
            Рекомендации для вас
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Откройте новые треки в глубинах темной музыки
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((track, index) => (
            <Card 
              key={track.id}
              className="bg-card/50 backdrop-blur border-primary/20 hover:border-primary/40 transition-all duration-500 group hover:scale-105 hover:shadow-glow animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-4">
                <div className="relative mb-4">
                  <img
                    src={track.thumbnail_url}
                    alt={track.title}
                    className="w-full h-48 object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder.svg';
                    }}
                  />
                  <div className="absolute inset-0 bg-black/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                    <Button
                      size="lg"
                      onClick={() => handlePlayTrack(track)}
                      className="bg-primary/90 hover:bg-primary transform scale-0 group-hover:scale-100 transition-transform duration-300 shadow-glow"
                    >
                      <Play className="w-6 h-6" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-bold text-lg truncate">{track.title}</h3>
                  <p className="text-muted-foreground truncate">{track.artist}</p>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm text-muted-foreground">{track.reason}</span>
                  </div>
                </div>
                
                <Button
                  className="w-full mt-4 transition-all duration-300 hover:shadow-glow"
                  variant="outline"
                  onClick={() => handlePlayTrack(track)}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Воспроизвести
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}