import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Edit, Trash2, Music, Upload, ArrowLeft, Library, Play, Download, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Navigate, useNavigate } from "react-router-dom";
import { usePlayer } from "@/contexts/PlayerContext";
import DownloadedTracksManager from "@/components/DownloadedTracksManager";
import RecommendationSetup from "@/components/RecommendationSetup";
import PlaylistManager from "@/components/PlaylistManager";

interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  tag: string | null;
}

interface Playlist {
  id: string;
  name: string;
  description: string | null;
  cover_url: string | null;
  tracks: any;
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

export default function Profile() {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { playTrack } = usePlayer();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [library, setLibrary] = useState<LibraryTrack[]>([]);
  const [activeTab, setActiveTab] = useState<'playlists' | 'library' | 'downloads'>('playlists');
  const [isEditing, setIsEditing] = useState(false);
  const [editingProfile, setEditingProfile] = useState({
    display_name: '',
    bio: '',
    tag: ''
  });
  const [uploading, setUploading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [showRecommendationSetup, setShowRecommendationSetup] = useState(false);
  const [isRecommendationConfigured, setIsRecommendationConfigured] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchPlaylists();
      fetchLibrary();
      checkRecommendationStatus();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-foreground font-gothic">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const fetchProfile = async () => {
    if (!navigator.onLine) return;
    
    const { data } = await supabase
      .from('profiles')
      .select('id, display_name, avatar_url, bio, tag')
      .eq('user_id', user.id)
      .maybeSingle();

    if (data) {
      setProfile(data);
      setEditingProfile({
        display_name: data.display_name || '',
        bio: data.bio || '',
        tag: data.tag || ''
      });
    }
  };

  const fetchPlaylists = async () => {
    if (!navigator.onLine) return;
    
    const { data } = await supabase
      .from('playlists')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (data) {
      setPlaylists(data);
    }
  };

  const fetchLibrary = async () => {
    if (!navigator.onLine) return;
    
    const { data } = await supabase
      .from('user_library')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (data) {
      setLibrary(data);
    }
  };

  const checkRecommendationStatus = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('user_preferences')
      .select('is_configured')
      .eq('user_id', user.id)
      .maybeSingle();
    
    setIsRecommendationConfigured(data?.is_configured || false);
  };

  const removeFromLibrary = async (id: string) => {
    try {
      const { error } = await supabase
        .from('user_library')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Удалено из библиотеки",
        description: "Трек успешно удален."
      });
      
      fetchLibrary();
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить трек",
        variant: "destructive"
      });
    }
  };

  const handleSaveProfile = async () => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: editingProfile.display_name.trim() || null,
          bio: editingProfile.bio.trim() || null,
          tag: editingProfile.tag.trim() || null
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Профиль обновлен",
        description: "Ваши изменения сохранены успешно."
      });
      
      setIsEditing(false);
      fetchProfile();
    } catch (error: any) {
      if (error.code === '23505') {
        toast({
          title: "Ошибка",
          description: "Этот тег уже используется другим пользователем",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Ошибка",
          description: "Не удалось обновить профиль",
          variant: "destructive"
        });
      }
    } finally {
      setUpdating(false);
    }
  };


  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Ошибка",
        description: "Размер файла не должен превышать 5MB",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      if (profile?.avatar_url) {
        const oldFileName = profile.avatar_url.split('/').pop();
        if (oldFileName) {
          await supabase.storage
            .from('avatars')
            .remove([`${user.id}/${oldFileName}`]);
        }
      }

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: urlData.publicUrl })
        .eq('user_id', user.id);

      if (updateError) throw updateError;
      
      toast({
        title: "Аватар обновлен",
        description: "Ваш аватар успешно загружен."
      });

      fetchProfile();
    } catch (error: any) {
      toast({
        title: "Ошибка загрузки",
        description: error.message || "Не удалось загрузить аватар",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const displayName = profile?.display_name || user.email?.split('@')[0] || 'User';
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/90 to-primary/5 py-8 relative pb-24">
      <Button 
        variant="ghost" 
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 z-30 text-muted-foreground hover:text-gothic-highlight"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        На главную
      </Button>

      <div className="container mx-auto px-4 max-w-6xl">
        <Card className="mb-8 bg-background/60 backdrop-blur-sm border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="font-gothic text-2xl text-foreground">
                Личный кабинет
              </CardTitle>
              {!isEditing && (
                <Button 
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                  className="border-primary/20 hover:bg-primary/10"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Редактировать
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="w-32 h-32 border-4 border-primary/20">
                  <AvatarImage src={profile?.avatar_url || undefined} alt={displayName} />
                  <AvatarFallback className="bg-primary/10 text-primary font-gothic text-4xl">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      ref={fileInputRef}
                      className="hidden"
                    />
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {uploading ? 'Загрузка...' : 'Загрузить фото'}
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="flex-1 space-y-4">
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Имя пользователя</label>
                      <Input
                        value={editingProfile.display_name}
                        onChange={(e) => setEditingProfile({...editingProfile, display_name: e.target.value})}
                        placeholder="Введите ваше имя"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Тег (для поиска в друзьях)</label>
                      <Input
                        value={editingProfile.tag}
                        onChange={(e) => setEditingProfile({...editingProfile, tag: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '')})}
                        placeholder="Введите уникальный тег (только английские буквы, цифры и _)"
                        maxLength={20}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {editingProfile.tag ? `Ваш тег: @${editingProfile.tag}` : 'Тег поможет друзьям найти вас'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">О себе</label>
                      <Textarea
                        value={editingProfile.bio}
                        onChange={(e) => setEditingProfile({...editingProfile, bio: e.target.value})}
                        placeholder="Расскажите о себе"
                        className="min-h-[100px]"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleSaveProfile} disabled={updating}>
                        {updating ? "Сохранение..." : "Сохранить"}
                      </Button>
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        Отмена
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <h3 className="text-xl font-bold text-foreground font-gothic">{displayName}</h3>
                      <p className="text-sm text-muted-foreground">{profile?.tag ? `@${profile.tag}` : 'Тег не установлен'}</p>
                    </div>
                    
                    {profile?.bio && (
                      <div>
                        <h4 className="font-medium text-foreground font-gothic mb-1">О себе</h4>
                        <p className="text-muted-foreground">{profile.bio}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Music Section with Tabs */}
        <Card className="bg-background/60 backdrop-blur-sm border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <CardTitle className="font-gothic text-xl text-foreground flex items-center">
                  <Music className="w-5 h-5 mr-2" />
                  Моя музыка
                </CardTitle>
                
                <div className="flex bg-background/30 rounded-lg p-1">
                  <Button
                    variant={activeTab === 'playlists' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab('playlists')}
                    className="text-sm"
                  >
                    Плейлисты ({playlists.length})
                  </Button>
                  <Button
                    variant={activeTab === 'library' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab('library')}
                    className="text-sm"
                  >
                    <Library className="w-4 h-4 mr-1" />
                    Библиотека ({library.length})
                  </Button>
                  <Button
                    variant={activeTab === 'downloads' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab('downloads')}
                    className="text-sm"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Скачанные
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            {activeTab === 'playlists' ? (
              <PlaylistManager 
                playlists={playlists}
                library={library}
                onPlaylistsUpdate={fetchPlaylists}
              />
            ) : activeTab === 'library' ? (
              <div className="space-y-4">
                {library.length > 0 ? (
                  <div className="grid grid-cols-1 gap-3">
                    {library.map((track) => (
                      <Card key={track.id} className="bg-background/40 border-primary/20 hover:bg-background/60 transition-colors">
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
                              <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                                <span>{track.duration}</span>
                                <span>Добавлен {new Date(track.created_at).toLocaleDateString('ru-RU')}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-8 h-8 p-0"
                                onClick={() => {
                                  const trackToPlay = {
                                    videoId: track.video_id,
                                    title: track.title,
                                    artist: track.artist || 'Unknown Artist',
                                    thumbnail: track.thumbnail_url
                                  };
                                  playTrack(trackToPlay);
                                }}
                              >
                                <Play className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFromLibrary(track.id)}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10 w-8 h-8 p-0"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Library className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-semibold text-lg text-foreground font-gothic mb-2">
                      Библиотека пуста
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Добавляйте треки в библиотеку с помощью кнопки + в плеере
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <DownloadedTracksManager 
                libraryTracks={library} 
                onLibraryUpdate={fetchLibrary}
              />
            )}
          </CardContent>
        </Card>

        {/* Настройка рекомендаций */}
        <Card className="bg-background/60 backdrop-blur-sm border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Settings className="w-5 h-5 text-primary" />
                <div>
                  <h3 className="font-medium">Персональные рекомендации</h3>
                  <p className="text-sm text-muted-foreground">
                    {isRecommendationConfigured 
                      ? "Рекомендации настроены и работают" 
                      : "Настройте предпочтения для получения персональных рекомендаций"
                    }
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={() => setShowRecommendationSetup(true)}
                  disabled={isRecommendationConfigured}
                  variant={isRecommendationConfigured ? "outline" : "default"}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  {isRecommendationConfigured ? "Настроено" : "Настроить ваши рекомендации"}
                </Button>
                {isRecommendationConfigured && (
                  <Button 
                    onClick={() => navigate('/my-wave')}
                    variant="default"
                  >
                    Моя волна
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <RecommendationSetup 
          open={showRecommendationSetup}
          onOpenChange={setShowRecommendationSetup}
          onComplete={() => {
            setIsRecommendationConfigured(true);
            checkRecommendationStatus();
          }}
        />
      </div>
    </div>
  );
}
