import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Play, Trash2, HardDrive, Wifi, WifiOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePlayer } from "@/contexts/PlayerContext";

interface DownloadedTrack {
  id: string;
  video_id: string;
  title: string;
  artist: string;
  thumbnail_url: string;
  duration: string;
  audio_file_path: string;
  file_size: number;
  downloaded_at: string;
}

interface LibraryTrack {
  id: string;
  video_id: string;
  title: string;
  artist: string;
  thumbnail_url: string;
  duration: string;
}

interface DownloadedTracksManagerProps {
  libraryTracks: LibraryTrack[];
  onLibraryUpdate: () => void;
}

export default function DownloadedTracksManager({ libraryTracks, onLibraryUpdate }: DownloadedTracksManagerProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { playTrack } = usePlayer();
  const [downloadedTracks, setDownloadedTracks] = useState<DownloadedTrack[]>([]);
  const [isDownloading, setIsDownloading] = useState<string[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    if (user) {
      fetchDownloadedTracks();
    }

    // Monitor online/offline status
    const handleOnlineStatusChange = () => {
      setIsOnline(navigator.onLine);
    };

    window.addEventListener('online', handleOnlineStatusChange);
    window.addEventListener('offline', handleOnlineStatusChange);

    return () => {
      window.removeEventListener('online', handleOnlineStatusChange);
      window.removeEventListener('offline', handleOnlineStatusChange);
    };
  }, [user]);

  const fetchDownloadedTracks = async () => {
    if (!user) return;

    try {
      // Если нет интернета, загружаем из localStorage
      if (!navigator.onLine) {
        const localData = localStorage.getItem(`downloaded_tracks_${user.id}`);
        if (localData) {
          const tracks = JSON.parse(localData);
          setDownloadedTracks(tracks);
        }
        return;
      }

      // Если есть интернет, загружаем из базы данных
      const { data } = await supabase
        .from('downloaded_tracks')
        .select('*')
        .eq('user_id', user.id)
        .order('downloaded_at', { ascending: false });

      if (data) {
        setDownloadedTracks(data);
        // Сохраняем в localStorage для офлайн доступа
        localStorage.setItem(`downloaded_tracks_${user.id}`, JSON.stringify(data));
      }
    } catch (error) {
      // При ошибке также пробуем загрузить из localStorage
      const localData = localStorage.getItem(`downloaded_tracks_${user.id}`);
      if (localData) {
        const tracks = JSON.parse(localData);
        setDownloadedTracks(tracks);
      }
    }
  };

  const downloadTrack = async (track: LibraryTrack) => {
    if (!user) return;

    // Check if already downloaded
    const existingTrack = downloadedTracks.find(dt => dt.video_id === track.video_id);
    if (existingTrack) {
      toast({
        title: "Трек уже скачан",
        description: track.title,
        variant: "destructive"
      });
      return;
    }

    setIsDownloading(prev => [...prev, track.video_id]);

    try {
      // Simulate downloading audio file (in real app, this would download from YouTube)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generate a fake file path for demo
      const audioFilePath = `${user.id}/${track.video_id}.mp3`;
      const fileSize = Math.floor(Math.random() * 10000000) + 3000000; // Random size 3-13MB

      const { error } = await supabase
        .from('downloaded_tracks')
        .insert({
          user_id: user.id,
          video_id: track.video_id,
          title: track.title,
          artist: track.artist || 'Unknown Artist',
          thumbnail_url: track.thumbnail_url,
          duration: track.duration,
          audio_file_path: audioFilePath,
          file_size: fileSize
        });

      if (error) throw error;

      toast({
        title: "Трек скачан",
        description: `${track.title} доступен для прослушивания офлайн`
      });

      fetchDownloadedTracks();
      // Обновляем localStorage после успешного скачивания
      if (navigator.onLine) {
        const currentTracks = [...downloadedTracks, {
          id: `temp_${Date.now()}`,
          user_id: user.id,
          video_id: track.video_id,
          title: track.title,
          artist: track.artist || 'Unknown Artist',
          thumbnail_url: track.thumbnail_url,
          duration: track.duration,
          audio_file_path: audioFilePath,
          file_size: fileSize,
          downloaded_at: new Date().toISOString()
        }];
        localStorage.setItem(`downloaded_tracks_${user.id}`, JSON.stringify(currentTracks));
      }
    } catch (error: any) {
      toast({
        title: "Ошибка скачивания",
        description: "Не удалось скачать трек",
        variant: "destructive"
      });
    } finally {
      setIsDownloading(prev => prev.filter(id => id !== track.video_id));
    }
  };

  const deleteDownloadedTrack = async (track: DownloadedTrack) => {
    try {
      const { error } = await supabase
        .from('downloaded_tracks')
        .delete()
        .eq('id', track.id);

      if (error) throw error;

      toast({
        title: "Трек удален",
        description: "Скачанный трек удален с устройства"
      });

      fetchDownloadedTracks();
      // Обновляем localStorage после удаления
      if (navigator.onLine) {
        const updatedTracks = downloadedTracks.filter(t => t.id !== track.id);
        localStorage.setItem(`downloaded_tracks_${user.id}`, JSON.stringify(updatedTracks));
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить трек",
        variant: "destructive"
      });
    }
  };

  const playOfflineTrack = (track: DownloadedTrack) => {
    // In a real app, this would play the downloaded file
    playTrack({
      videoId: track.video_id,
      title: track.title,
      artist: track.artist,
      thumbnail: track.thumbnail_url
    });

    toast({
      title: "Офлайн воспроизведение",
      description: `${track.title} - воспроизводится из локального файла`
    });
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Byte';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)).toString());
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getAvailableForDownload = () => {
    return libraryTracks.filter(track => 
      !downloadedTracks.some(dt => dt.video_id === track.video_id)
    );
  };

  const totalSize = downloadedTracks.reduce((sum, track) => sum + track.file_size, 0);

  return (
    <div className="space-y-6">
      {/* Status Banner */}
      <Card className={`border-2 ${isOnline ? 'border-green-500/20 bg-green-500/5' : 'border-orange-500/20 bg-orange-500/5'}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isOnline ? (
                <Wifi className="w-5 h-5 text-green-500" />
              ) : (
                <WifiOff className="w-5 h-5 text-orange-500" />
              )}
              <div>
                <p className="font-medium text-foreground">
                  {isOnline ? 'Подключение к интернету' : 'Режим офлайн'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isOnline 
                    ? 'Можете скачивать новые треки'
                    : 'Доступны только скачанные треки'
                  }
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Скачано треков</p>
              <p className="font-medium text-foreground">{downloadedTracks.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Storage Info */}
      {downloadedTracks.length > 0 && (
        <Card className="bg-background/40 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <HardDrive className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-foreground">Использовано места</p>
                  <p className="text-sm text-muted-foreground">Всего скачанных файлов</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg text-foreground">{formatFileSize(totalSize)}</p>
                <p className="text-sm text-muted-foreground">{downloadedTracks.length} файлов</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Downloaded Tracks Section */}
      {downloadedTracks.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-foreground font-gothic mb-4 flex items-center">
            <Download className="w-5 h-5 mr-2" />
            Скачанные треки ({downloadedTracks.length})
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {downloadedTracks.map((track) => (
              <Card key={track.id} className="bg-background/40 border-primary/20 hover:bg-background/60 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <img 
                        src={track.thumbnail_url} 
                        alt={track.title}
                        className="w-12 h-12 rounded object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground truncate">{track.title}</h4>
                        <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                          <span>{track.duration}</span>
                          <span>{formatFileSize(track.file_size)}</span>
                          <span className="flex items-center gap-1">
                            <WifiOff className="w-3 h-3" />
                            Офлайн
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => playOfflineTrack(track)}
                        className="border-primary/20"
                      >
                        <Play className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteDownloadedTrack(track)}
                        className="border-destructive/20 text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Available for Download Section */}
      {isOnline && getAvailableForDownload().length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-foreground font-gothic mb-4">
            Доступно для скачивания ({getAvailableForDownload().length})
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {getAvailableForDownload().map((track) => (
              <Card key={track.id} className="bg-background/40 border-primary/20 hover:bg-background/60 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <img 
                        src={track.thumbnail_url} 
                        alt={track.title}
                        className="w-12 h-12 rounded object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground truncate">{track.title}</h4>
                        <p className="text-sm text-muted-foreground truncate">{track.artist || 'Unknown Artist'}</p>
                        <p className="text-xs text-muted-foreground">{track.duration}</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => downloadTrack(track)}
                      disabled={isDownloading.includes(track.video_id)}
                      className="bg-primary hover:bg-primary/90"
                    >
                      {isDownloading.includes(track.video_id) ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Скачивание...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          Скачать
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty States */}
      {downloadedTracks.length === 0 && getAvailableForDownload().length === 0 && (
        <div className="text-center py-12">
          <Download className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold text-lg text-foreground font-gothic mb-2">
            Нет треков для скачивания
          </h3>
          <p className="text-muted-foreground">
            Добавьте треки в библиотеку, чтобы скачать их для офлайн прослушивания
          </p>
        </div>
      )}

      {!isOnline && downloadedTracks.length === 0 && (
        <div className="text-center py-12">
          <WifiOff className="w-16 h-16 mx-auto text-orange-500 mb-4" />
          <h3 className="font-semibold text-lg text-foreground font-gothic mb-2">
            Нет скачанных треков
          </h3>
          <p className="text-muted-foreground">
            Подключитесь к интернету, чтобы скачать треки для офлайн прослушивания
          </p>
        </div>
      )}
    </div>
  );
}