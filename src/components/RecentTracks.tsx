import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Clock } from "lucide-react";
import { usePlayer } from "@/contexts/PlayerContext";

interface RecentTrack {
  id: string;
  video_id: string;
  title: string;
  artist: string | null;
  thumbnail_url: string | null;
  duration: string | null;
  played_at: string;
}

export default function RecentTracks() {
  const { user } = useAuth();
  const { playTrack } = usePlayer();
  const [recentTracks, setRecentTracks] = useState<RecentTrack[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadRecentTracks();
    }
  }, [user]);

  const loadRecentTracks = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data } = await supabase
        .from('listening_history')
        .select('*')
        .eq('user_id', user.id)
        .order('played_at', { ascending: false })
        .limit(10);

      if (data) {
        setRecentTracks(data);
      }
    } catch (error) {
      console.error('Error loading recent tracks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayTrack = (track: RecentTrack) => {
    playTrack({
      videoId: track.video_id,
      title: track.title,
      artist: track.artist || 'Unknown Artist',
      thumbnail: track.thumbnail_url || ''
    });
  };

  if (!user) {
    return (
      <Card className="bg-card/50 backdrop-blur border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gothic-highlight">
            <Clock className="w-5 h-5" />
            Недавние треки
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Войдите в систему, чтобы видеть недавние треки
          </p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="bg-card/50 backdrop-blur border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gothic-highlight">
            <Clock className="w-5 h-5" />
            Недавние треки
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">Загрузка...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50 backdrop-blur border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gothic-highlight">
          <Clock className="w-5 h-5" />
          Недавние треки ({recentTracks.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recentTracks.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            Пока нет недавних треков
          </p>
        ) : (
          <div className="space-y-3">
            {recentTracks.map((track) => (
              <div
                key={track.id}
                className="flex items-center gap-3 p-3 rounded-lg border bg-background/50 hover:bg-background/80 transition-colors"
              >
                {track.thumbnail_url && (
                  <img
                    src={track.thumbnail_url}
                    alt={track.title}
                    className="w-12 h-12 rounded object-cover"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate">
                    {track.title}
                  </h4>
                  <p className="text-xs text-muted-foreground truncate">
                    {track.artist || 'Unknown Artist'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(track.played_at).toLocaleDateString('ru-RU')}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handlePlayTrack(track)}
                  className="shrink-0"
                >
                  <Play className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}