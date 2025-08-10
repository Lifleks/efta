import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Music, Play, Search, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePlayer } from "@/contexts/PlayerContext";

interface Playlist {
  id: string;
  name: string;
  description: string | null;
  cover_url: string | null;
  tracks: any[];
  created_at: string;
}

interface LibraryTrack {
  id: string;
  video_id: string;
  title: string;
  artist: string;
  thumbnail_url: string;
  duration: string;
  created_at: string;
}

interface PlaylistManagerProps {
  playlists: Playlist[];
  library: LibraryTrack[];
  onPlaylistsUpdate: () => void;
}

export default function PlaylistManager({ playlists, library, onPlaylistsUpdate }: PlaylistManagerProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { playTrack } = usePlayer();
  
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [editingPlaylist, setEditingPlaylist] = useState<{ name: string; description: string } | null>(null);
  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);
  const [newPlaylist, setNewPlaylist] = useState({ name: '', description: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddTracks, setShowAddTracks] = useState(false);
  const [selectedTracks, setSelectedTracks] = useState<Set<string>>(new Set());

  const createPlaylist = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('playlists')
        .insert({
          user_id: user.id,
          name: newPlaylist.name,
          description: newPlaylist.description
        });

      if (error) throw error;

      toast({
        title: "Плейлист создан",
        description: "Новый плейлист успешно добавлен."
      });
      
      setIsCreatingPlaylist(false);
      setNewPlaylist({ name: '', description: '' });
      onPlaylistsUpdate();
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось создать плейлист",
        variant: "destructive"
      });
    }
  };

  const updatePlaylist = async (playlistId: string, updates: { name?: string; description?: string; tracks?: any[] }) => {
    try {
      const { error } = await supabase
        .from('playlists')
        .update(updates)
        .eq('id', playlistId);

      if (error) throw error;

      toast({
        title: "Плейлист обновлен",
        description: "Изменения сохранены успешно."
      });
      
      onPlaylistsUpdate();
      setEditingPlaylist(null);
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить плейлист",
        variant: "destructive"
      });
    }
  };

  const deletePlaylist = async (id: string) => {
    try {
      const { error } = await supabase
        .from('playlists')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Плейлист удален",
        description: "Плейлист успешно удален."
      });
      
      setSelectedPlaylist(null);
      onPlaylistsUpdate();
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить плейлист",
        variant: "destructive"
      });
    }
  };

  const addTracksToPlaylist = async () => {
    if (!selectedPlaylist || selectedTracks.size === 0) return;

    const tracksToAdd = library.filter(track => selectedTracks.has(track.id));
    const playlistTracks = selectedPlaylist.tracks || [];
    
    // Проверяем, нет ли уже таких треков в плейлисте
    const newTracks = tracksToAdd.filter(track => 
      !playlistTracks.some(existing => existing.video_id === track.video_id)
    );

    if (newTracks.length === 0) {
      toast({
        title: "Информация",
        description: "Все выбранные треки уже есть в плейлисте"
      });
      return;
    }

    const updatedTracks = [...playlistTracks, ...newTracks.map(track => ({
      video_id: track.video_id,
      title: track.title,
      artist: track.artist,
      thumbnail_url: track.thumbnail_url,
      duration: track.duration
    }))];

    await updatePlaylist(selectedPlaylist.id, { tracks: updatedTracks });
    setSelectedTracks(new Set());
    setShowAddTracks(false);
  };

  const removeTrackFromPlaylist = async (trackVideoId: string) => {
    if (!selectedPlaylist) return;

    const updatedTracks = (selectedPlaylist.tracks || []).filter(
      track => track.video_id !== trackVideoId
    );

    await updatePlaylist(selectedPlaylist.id, { tracks: updatedTracks });
  };

  const playPlaylist = (tracks: any[]) => {
    if (tracks.length > 0) {
      const track = tracks[0];
      playTrack({
        videoId: track.video_id,
        title: track.title,
        artist: track.artist || 'Unknown Artist',
        thumbnail: track.thumbnail_url
      });
    }
  };

  const filteredTracks = selectedPlaylist ? 
    (selectedPlaylist.tracks || []).filter(track =>
      track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.artist.toLowerCase().includes(searchQuery.toLowerCase())
    ) : [];

  const availableLibraryTracks = library.filter(track => 
    !selectedTracks.has(track.id) &&
    !(selectedPlaylist?.tracks || []).some(existing => existing.video_id === track.video_id)
  );

  return (
    <div className="space-y-6">
      {/* Создание плейлиста */}
      {isCreatingPlaylist && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <Input
                placeholder="Название плейлиста"
                value={newPlaylist.name}
                onChange={(e) => setNewPlaylist({...newPlaylist, name: e.target.value})}
                className="bg-background/50 border-primary/20"
              />
              <Textarea
                placeholder="Описание плейлиста (необязательно)"
                value={newPlaylist.description}
                onChange={(e) => setNewPlaylist({...newPlaylist, description: e.target.value})}
                className="bg-background/50 border-primary/20 resize-none"
                rows={2}
              />
              <div className="flex gap-2">
                <Button 
                  onClick={createPlaylist}
                  disabled={!newPlaylist.name.trim()}
                  className="bg-primary hover:bg-primary/90"
                >
                  Создать
                </Button>
                <Button 
                  onClick={() => setIsCreatingPlaylist(false)}
                  variant="outline"
                  className="border-primary/20"
                >
                  Отменить
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!selectedPlaylist ? (
        <>
          {/* Кнопка создания плейлиста */}
          {!isCreatingPlaylist && (
            <div className="flex justify-end">
              <Button 
                onClick={() => setIsCreatingPlaylist(true)}
                className="bg-primary hover:bg-primary/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Создать плейлист
              </Button>
            </div>
          )}

          {/* Список плейлистов */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {playlists.map((playlist) => (
              <Card key={playlist.id} className="bg-background/40 border-primary/20 hover:bg-background/60 transition-colors cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h3 
                      className="font-semibold text-foreground font-gothic truncate cursor-pointer"
                      onClick={() => setSelectedPlaylist(playlist)}
                    >
                      {playlist.name}
                    </h3>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingPlaylist({ name: playlist.name, description: playlist.description || '' })}
                        className="text-muted-foreground hover:text-foreground p-1 h-auto"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deletePlaylist(playlist.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 p-1 h-auto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {playlist.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {playlist.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                    <span>{Array.isArray(playlist.tracks) ? playlist.tracks.length : 0} треков</span>
                    <span>{new Date(playlist.created_at).toLocaleDateString('ru-RU')}</span>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedPlaylist(playlist)}
                      className="flex-1"
                    >
                      Открыть
                    </Button>
                    {playlist.tracks && playlist.tracks.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => playPlaylist(playlist.tracks)}
                        className="w-8 h-8 p-0"
                      >
                        <Play className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>

                {/* Диалог редактирования */}
                {editingPlaylist && (
                  <Dialog open={!!editingPlaylist} onOpenChange={() => setEditingPlaylist(null)}>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Редактировать плейлист</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Input
                          placeholder="Название плейлиста"
                          value={editingPlaylist.name}
                          onChange={(e) => setEditingPlaylist({...editingPlaylist, name: e.target.value})}
                        />
                        <Textarea
                          placeholder="Описание плейлиста"
                          value={editingPlaylist.description}
                          onChange={(e) => setEditingPlaylist({...editingPlaylist, description: e.target.value})}
                          rows={3}
                        />
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => updatePlaylist(playlist.id, editingPlaylist)}
                            disabled={!editingPlaylist.name.trim()}
                          >
                            Сохранить
                          </Button>
                          <Button variant="outline" onClick={() => setEditingPlaylist(null)}>
                            Отмена
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </Card>
            ))}
            
            {playlists.length === 0 && !isCreatingPlaylist && (
              <div className="col-span-full text-center py-12">
                <Music className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold text-lg text-foreground font-gothic mb-2">
                  Пока нет плейлистов
                </h3>
                <p className="text-muted-foreground mb-4">
                  Создайте свой первый плейлист для хранения любимой музыки
                </p>
                <Button 
                  onClick={() => setIsCreatingPlaylist(true)}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Создать плейлист
                </Button>
              </div>
            )}
          </div>
        </>
      ) : (
        /* Просмотр плейлиста */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Button
                variant="ghost"
                onClick={() => setSelectedPlaylist(null)}
                className="mb-2"
              >
                ← Назад к плейлистам
              </Button>
              <h2 className="text-2xl font-bold font-gothic">{selectedPlaylist.name}</h2>
              {selectedPlaylist.description && (
                <p className="text-muted-foreground">{selectedPlaylist.description}</p>
              )}
            </div>
            <div className="flex gap-2">
              <Dialog open={showAddTracks} onOpenChange={setShowAddTracks}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Добавить треки
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Добавить треки из библиотеки</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    {availableLibraryTracks.length > 0 ? (
                      <>
                        <div className="max-h-96 overflow-y-auto space-y-2">
                          {availableLibraryTracks.map((track) => (
                            <div key={track.id} className="flex items-center gap-3 p-2 rounded hover:bg-background/50 transition-all duration-300 hover:scale-[1.02] animate-fade-in">
                              <input
                                type="checkbox"
                                checked={selectedTracks.has(track.id)}
                                onChange={(e) => {
                                  const newSelected = new Set(selectedTracks);
                                  if (e.target.checked) {
                                    newSelected.add(track.id);
                                  } else {
                                    newSelected.delete(track.id);
                                  }
                                  setSelectedTracks(newSelected);
                                }}
                                className="transition-transform duration-200 hover:scale-110"
                              />
                              <img
                                src={track.thumbnail_url || '/placeholder.svg'}
                                alt={track.title}
                                className="w-12 h-12 rounded object-cover"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{track.title}</p>
                                <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            onClick={addTracksToPlaylist} 
                            disabled={selectedTracks.size === 0}
                            className="transition-all duration-300 hover:scale-105 hover:shadow-glow"
                          >
                            Добавить ({selectedTracks.size})
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => {
                              setShowAddTracks(false);
                              setSelectedTracks(new Set());
                            }}
                            className="transition-all duration-300 hover:scale-105"
                          >
                            Отмена
                          </Button>
                        </div>
                      </>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">
                        Нет доступных треков для добавления
                      </p>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
              {selectedPlaylist.tracks && selectedPlaylist.tracks.length > 0 && (
                <Button onClick={() => playPlaylist(selectedPlaylist.tracks)}>
                  <Play className="w-4 h-4 mr-2" />
                  Воспроизвести
                </Button>
              )}
            </div>
          </div>

          {/* Поиск по трекам */}
          {selectedPlaylist.tracks && selectedPlaylist.tracks.length > 0 && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Поиск по трекам в плейлисте..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          )}

          {/* Список треков */}
          {selectedPlaylist.tracks && selectedPlaylist.tracks.length > 0 ? (
            <div className="space-y-2">
              {filteredTracks.map((track, index) => (
                <Card key={`${track.video_id}-${index}`} className="bg-background/40 border-primary/20">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={track.thumbnail_url || '/placeholder.svg'}
                        alt={track.title}
                        className="w-16 h-16 rounded object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-foreground font-gothic truncate">
                          {track.title}
                        </h4>
                        <p className="text-sm text-muted-foreground truncate">
                          {track.artist}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {track.duration}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            playTrack({
                              videoId: track.video_id,
                              title: track.title,
                              artist: track.artist || 'Unknown Artist',
                              thumbnail: track.thumbnail_url
                            });
                          }}
                          className="w-8 h-8 p-0"
                        >
                          <Play className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTrackFromPlaylist(track.video_id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 w-8 h-8 p-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {filteredTracks.length === 0 && searchQuery && (
                <p className="text-muted-foreground text-center py-8">
                  Треки не найдены по запросу "{searchQuery}"
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <Music className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg text-foreground font-gothic mb-2">
                Плейлист пуст
              </h3>
              <p className="text-muted-foreground mb-4">
                Добавьте треки из вашей библиотеки
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}