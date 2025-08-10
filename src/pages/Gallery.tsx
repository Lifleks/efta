import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Search, Music, Play, User, ArrowLeft, Album } from "lucide-react";
import { usePlayer } from "@/contexts/PlayerContext";
import { Skeleton } from "@/components/ui/skeleton";

interface Track {
  videoId: string;
  title: string;
  artist: string;
  thumbnail?: string;
}

interface ArtistInfo {
  name: string;
  tracks: Track[];
  totalTracks: number;
  albums: string[];
}

interface ArtistGroup {
  artist: string;
  tracks: Track[];
  count: number;
}

const Gallery = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { playTrack } = usePlayer();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [artistGroups, setArtistGroups] = useState<ArtistGroup[]>([]);
  const [recommendations, setRecommendations] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState<ArtistGroup | null>(null);
  const [showArtistModal, setShowArtistModal] = useState(false);
  const [currentArtistInfo, setCurrentArtistInfo] = useState<ArtistInfo | null>(null);
  const [searchedArtists, setSearchedArtists] = useState<ArtistInfo[]>([]);

  useEffect(() => {
    if (!user) {
      setShowAuthDialog(true);
      return;
    }
    loadRecommendations();
  }, [user]);

  const loadRecommendations = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Получаем историю прослушиваний пользователя
      const { data: history } = await supabase
        .from('listening_history')
        .select('*')
        .eq('user_id', user.id)
        .order('played_at', { ascending: false })
        .limit(50);

      if (history && history.length > 0) {
        // Группируем по исполнителям
        const artistCounts = history.reduce((acc, track) => {
          if (track.artist) {
            acc[track.artist] = (acc[track.artist] || 0) + 1;
          }
          return acc;
        }, {} as Record<string, number>);

        // Создаем рекомендации на основе популярных исполнителей
        const topArtists = Object.entries(artistCounts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([artist]) => artist);

        // Формируем рекомендации из истории
        const recs = history
          .filter(track => topArtists.includes(track.artist || ''))
          .slice(0, 12)
          .map(track => ({
            videoId: track.video_id,
            title: track.title,
            artist: track.artist || '',
            thumbnail: track.thumbnail_url || undefined
          }));

        setRecommendations(recs);
      }
    } catch (error) {
      console.error('Error loading recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchTracks = async (query: string) => {
    if (!query.trim() || !user) return;

    setLoading(true);
    try {
      // Поиск в истории прослушиваний и библиотеке
      const { data: historyTracks } = await supabase
        .from('listening_history')
        .select('*')
        .eq('user_id', user.id)
        .ilike('artist', `%${query}%`);

      const { data: libraryTracks } = await supabase
        .from('user_library')
        .select('*')
        .eq('user_id', user.id)
        .ilike('artist', `%${query}%`);

      // Объединяем и убираем дубликаты
      const allTracks = [
        ...(historyTracks || []).map(track => ({
          videoId: track.video_id,
          title: track.title,
          artist: track.artist || '',
          thumbnail: track.thumbnail_url || undefined
        })),
        ...(libraryTracks || []).map(track => ({
          videoId: track.video_id,
          title: track.title,
          artist: track.artist || '',
          thumbnail: track.thumbnail_url || undefined
        }))
      ];

      // Убираем дубликаты по videoId
      const uniqueTracks = allTracks.filter((track, index, self) => 
        index === self.findIndex(t => t.videoId === track.videoId)
      );

      setSearchResults(uniqueTracks);

      // Группируем по исполнителям для создания профилей исполнителей
      const artistGroupsMap = uniqueTracks.reduce((acc, track) => {
        const artistName = track.artist.toLowerCase();
        if (!acc[artistName]) {
          acc[artistName] = [];
        }
        acc[artistName].push(track);
        return acc;
      }, {} as Record<string, Track[]>);

      // Создаем информацию об исполнителях
      const artistsInfo: ArtistInfo[] = Object.entries(artistGroupsMap)
        .filter(([artistName]) => artistName.toLowerCase().includes(query.toLowerCase()))
        .map(([artistName, tracks]) => {
          // Извлекаем уникальные альбомы (предполагаем, что альбом может быть частью названия)
          const albums = [...new Set(
            tracks
              .map(track => {
                // Простая логика извлечения альбома из названия трека
                const parts = track.title.split('-');
                if (parts.length > 1) {
                  return parts[0].trim();
                }
                return 'Синглы';
              })
              .filter(album => album.length > 0)
          )];

          return {
            name: tracks[0].artist, // Используем оригинальное написание
            tracks,
            totalTracks: tracks.length,
            albums
          };
        })
        .sort((a, b) => b.totalTracks - a.totalTracks);

      setSearchedArtists(artistsInfo);

      // Группируем по исполнителям для отображения исполнителей с более чем 10 треками
      const groups = artistsInfo
        .filter(artist => artist.totalTracks >= 10)
        .map(artist => ({
          artist: artist.name,
          tracks: artist.tracks,
          count: artist.totalTracks
        }));

      setArtistGroups(groups);
    } catch (error) {
      console.error('Error searching tracks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchTracks(searchQuery);
  };

  const openArtistModal = (artist: ArtistInfo) => {
    setCurrentArtistInfo(artist);
    setShowArtistModal(true);
  };

  const handlePlayTrack = (track: Track) => {
    playTrack({
      videoId: track.videoId,
      title: track.title,
      artist: track.artist,
      thumbnail: track.thumbnail
    });
  };

  if (showAuthDialog) {
    return (
      <Dialog open={showAuthDialog} onOpenChange={() => navigate('/')}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Требуется авторизация</DialogTitle>
            <DialogDescription>
              Пожалуйста, авторизуйтесь для доступа к галерее треков.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 mt-4">
            <Button onClick={() => navigate('/auth')} className="flex-1">
              Войти
            </Button>
            <Button variant="outline" onClick={() => navigate('/')} className="flex-1">
              Назад
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (selectedArtist) {
    return (
      <div className="min-h-screen bg-background font-gothic p-6 pb-24">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant="ghost" 
              onClick={() => setSelectedArtist(null)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Назад
            </Button>
            <h1 className="text-3xl font-bold text-primary">{selectedArtist.artist}</h1>
            <span className="text-muted-foreground">({selectedArtist.count} треков)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {selectedArtist.tracks.map((track, index) => (
              <Card key={`${track.videoId}-${index}`} className="cursor-pointer hover:bg-accent/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    {track.thumbnail ? (
                      <img 
                        src={track.thumbnail} 
                        alt={track.title}
                        className="w-12 h-12 rounded object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded bg-primary/20 flex items-center justify-center">
                        <Music className="w-6 h-6 text-primary" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm truncate">{track.title}</h3>
                      <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handlePlayTrack(track)}
                    >
                      <Play className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-gothic p-6 pb-24">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            На главную
          </Button>
          <h1 className="text-4xl font-bold text-primary">Галерея треков</h1>
        </div>

        {/* Поиск */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Поиск по исполнителю
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                placeholder="Введите имя исполнителя..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" disabled={loading}>
                Найти
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Найденные исполнители */}
        {searchedArtists.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Найденные исполнители
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchedArtists.map((artist) => (
                  <Card 
                    key={artist.name} 
                    className="cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => openArtistModal(artist)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-lg">{artist.name}</h3>
                          <p className="text-sm text-muted-foreground">{artist.totalTracks} треков</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {artist.albums.slice(0, 3).map((album, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {album}
                              </Badge>
                            ))}
                            {artist.albums.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{artist.albums.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <User className="w-8 h-8 text-primary" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Исполнители с большим количеством треков */}
        {artistGroups.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Исполнители (10+ треков)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {artistGroups.map((group) => (
                  <Card 
                    key={group.artist} 
                    className="cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => setSelectedArtist(group)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{group.artist}</h3>
                          <p className="text-sm text-muted-foreground">{group.count} треков</p>
                        </div>
                        <Music className="w-6 h-6 text-primary" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Результаты поиска */}
        {searchResults.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Результаты поиска</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {searchResults.map((track, index) => (
                  <Card key={`${track.videoId}-search-${index}`} className="cursor-pointer hover:bg-accent/50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        {track.thumbnail ? (
                          <img 
                            src={track.thumbnail} 
                            alt={track.title}
                            className="w-12 h-12 rounded object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded bg-primary/20 flex items-center justify-center">
                            <Music className="w-6 h-6 text-primary" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm truncate">{track.title}</h3>
                          <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handlePlayTrack(track)}
                        >
                          <Play className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Рекомендации */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Music className="w-5 h-5" />
              Рекомендованные треки
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-4">
                    <Skeleton className="w-12 h-12 rounded" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-3 w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recommendations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {recommendations.map((track, index) => (
                  <Card key={`${track.videoId}-rec-${index}`} className="cursor-pointer hover:bg-accent/50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        {track.thumbnail ? (
                          <img 
                            src={track.thumbnail} 
                            alt={track.title}
                            className="w-12 h-12 rounded object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded bg-primary/20 flex items-center justify-center">
                            <Music className="w-6 h-6 text-primary" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm truncate">{track.title}</h3>
                          <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handlePlayTrack(track)}
                        >
                          <Play className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Начните слушать музыку, чтобы получить персональные рекомендации
              </p>
            )}
          </CardContent>
        </Card>

        {/* Модальное окно исполнителя */}
        <Dialog open={showArtistModal} onOpenChange={setShowArtistModal}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-2xl">
                <User className="w-8 h-8 text-primary" />
                {currentArtistInfo?.name}
              </DialogTitle>
              <DialogDescription>
                {currentArtistInfo?.totalTracks} треков • {currentArtistInfo?.albums.length} альбомов
              </DialogDescription>
            </DialogHeader>
            
            {currentArtistInfo && (
              <div className="space-y-6">
                {/* Альбомы */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Album className="w-5 h-5" />
                    Альбомы и коллекции
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {currentArtistInfo.albums.map((album, index) => (
                      <Badge key={index} variant="outline" className="text-sm">
                        {album}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Треки */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Music className="w-5 h-5" />
                    Все треки
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                    {currentArtistInfo.tracks.map((track, index) => (
                      <Card key={`${track.videoId}-modal-${index}`} className="cursor-pointer hover:bg-accent/50 transition-colors">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-3">
                            {track.thumbnail ? (
                              <img 
                                src={track.thumbnail} 
                                alt={track.title}
                                className="w-10 h-10 rounded object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded bg-primary/20 flex items-center justify-center">
                                <Music className="w-5 h-5 text-primary" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm truncate">{track.title}</h4>
                              <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                handlePlayTrack(track);
                                setShowArtistModal(false);
                              }}
                            >
                              <Play className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Gallery;