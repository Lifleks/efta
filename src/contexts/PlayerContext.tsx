import { createContext, useContext, useState, useRef, ReactNode, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface Track {
  videoId: string;
  title: string;
  artist: string;
  thumbnail?: string;
}

interface PlayerContextType {
  // Player state
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number[];
  isMuted: boolean;
  currentTrack: Track | null;
  isInLibrary: boolean;
  playerReady: boolean;
  
  // Player controls
  togglePlay: () => void;
  playTrack: (track: Track) => void;
  nextTrack: () => void;
  prevTrack: () => void;
  handleProgressChange: (value: number[]) => void;
  handleVolumeChange: (value: number[]) => void;
  toggleMute: () => void;
  addToLibrary: () => void;
  removeFromLibrary: () => void;
  
  // Player ref
  playerRef: React.RefObject<any>;
  setPlayerReady: (ready: boolean) => void;
  setIsPlaying: (playing: boolean) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  return context;
};

interface PlayerProviderProps {
  children: ReactNode;
}

export const PlayerProvider = ({ children }: PlayerProviderProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState([80]);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isInLibrary, setIsInLibrary] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);
  
  const playerRef = useRef<any>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  // Дефолтные треки для случайного воспроизведения
  const defaultTracks: Track[] = [
    {
      videoId: "jfKfPfyJRdk",
      title: "lofi hip hop radio - beats to relax/study to",
      artist: "Lofi Girl"
    },
    {
      videoId: "4xDzrJKXOOY",
      title: "Dark Ambient Music - The Abyss",
      artist: "Cryo Chamber"
    },
    {
      videoId: "5qap5aO4i9A",
      title: "Dark Synthwave Mix",
      artist: "Various Artists"
    }
  ];

  useEffect(() => {
    const updateTime = () => {
      if (playerRef.current && playerReady) {
        const currentSeconds = playerRef.current.getCurrentTime();
        const totalSeconds = playerRef.current.getDuration();
        setCurrentTime(currentSeconds);
        setDuration(totalSeconds || 0);
      }
    };

    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [playerReady]);

  useEffect(() => {
    if (currentTrack && user) {
      checkIfInLibrary();
    }
  }, [currentTrack, user]);

  const checkIfInLibrary = async () => {
    if (!currentTrack || !user || !navigator.onLine) return;

    const { data } = await supabase
      .from('user_library')
      .select('id')
      .eq('user_id', user.id)
      .eq('video_id', currentTrack.videoId)
      .maybeSingle();

    setIsInLibrary(!!data);
  };

  const playRandomTrack = () => {
    const randomTrack = defaultTracks[Math.floor(Math.random() * defaultTracks.length)];
    setCurrentTrack(randomTrack);
  };

  const togglePlay = () => {
    if (!currentTrack) {
      playRandomTrack();
      return;
    }

    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.pauseVideo();
      } else {
        playerRef.current.playVideo();
      }
    }
  };

  const playTrack = async (track: Track) => {
    setCurrentTrack(track);
    
    // Add to listening history if user is logged in
    if (user && navigator.onLine) {
      try {
        await supabase
          .from('listening_history')
          .insert({
            user_id: user.id,
            video_id: track.videoId,
            title: track.title,
            artist: track.artist,
            thumbnail_url: track.thumbnail || null,
            duration: formatTime(duration) || null
          });
      } catch (error) {
        console.error('Error adding to listening history:', error);
      }
    }
  };

  const handleProgressChange = (value: number[]) => {
    if (playerRef.current && playerReady) {
      playerRef.current.seekTo(value[0]);
      setCurrentTime(value[0]);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    if (playerRef.current) {
      playerRef.current.setVolume(value[0]);
      setVolume(value);
      setIsMuted(value[0] === 0);
    }
  };

  const toggleMute = () => {
    if (playerRef.current) {
      if (isMuted) {
        playerRef.current.setVolume(volume[0]);
        setIsMuted(false);
      } else {
        playerRef.current.setVolume(0);
        setIsMuted(true);
      }
    }
  };

  const nextTrack = () => {
    playRandomTrack();
  };

  const prevTrack = () => {
    playRandomTrack();
  };

  const addToLibrary = async () => {
    if (!currentTrack || !user) {
      toast({
        title: "Ошибка",
        description: "Необходимо войти в систему",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('user_library')
        .insert({
          user_id: user.id,
          video_id: currentTrack.videoId,
          title: currentTrack.title,
          artist: currentTrack.artist,
          thumbnail_url: currentTrack.thumbnail || '',
          duration: formatTime(duration)
        });

      if (error) throw error;

      setIsInLibrary(true);
      toast({
        title: "Добавлено в библиотеку",
        description: currentTrack.title
      });
    } catch (error: any) {
      if (error.code === '23505') {
        toast({
          title: "Трек уже в библиотеке",
          description: currentTrack.title
        });
      } else {
        toast({
          title: "Ошибка",
          description: "Не удалось добавить в библиотеку",
          variant: "destructive"
        });
      }
    }
  };

  const removeFromLibrary = async () => {
    if (!currentTrack || !user) return;

    try {
      const { error } = await supabase
        .from('user_library')
        .delete()
        .eq('user_id', user.id)
        .eq('video_id', currentTrack.videoId);

      if (error) throw error;

      setIsInLibrary(false);
      toast({
        title: "Удалено из библиотеки",
        description: currentTrack.title
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить из библиотеки",
        variant: "destructive"
      });
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const value: PlayerContextType = {
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    currentTrack,
    isInLibrary,
    playerReady,
    togglePlay,
    playTrack,
    nextTrack,
    prevTrack,
    handleProgressChange,
    handleVolumeChange,
    toggleMute,
    addToLibrary,
    removeFromLibrary,
    playerRef,
    setPlayerReady,
    setIsPlaying,
    setCurrentTime,
    setDuration
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
};