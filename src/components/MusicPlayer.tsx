import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { usePlayer } from "@/contexts/PlayerContext";
import YouTube from "react-youtube";
import MusicSearch from "./MusicSearch";

interface Track {
  videoId: string;
  title: string;
  artist: string;
  thumbnail?: string;
}

interface SearchResult {
  videoId: string;
  title: string;
  artist: string;
  thumbnail: string;
}

const MusicPlayer = () => {
  const { user } = useAuth();
  const {
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
    setIsPlaying
  } = usePlayer();

  const handleTrackSelect = (searchResult: SearchResult) => {
    const track: Track = {
      videoId: searchResult.videoId,
      title: searchResult.title,
      artist: searchResult.artist,
      thumbnail: searchResult.thumbnail
    };
    playTrack(track);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const onPlayerReady = (event: any) => {
    if (playerRef.current) {
      Object.assign(playerRef.current, event.target);
    } else {
      (playerRef as any).current = event.target;
    }
    setPlayerReady(true);
    if (playerRef.current) {
      playerRef.current.setVolume(volume[0]);
    }
  };

  const onPlayerStateChange = (event: any) => {
    const playerState = event.data;
    setIsPlaying(playerState === 1);
    
    if (playerState === 0) { // ended
      nextTrack();
    }
  };

  const opts = {
    height: '0',
    width: '0',
    playerVars: {
      autoplay: 0,
      controls: 0,
      disablekb: 1,
      fs: 0,
      iv_load_policy: 3,
      modestbranding: 1,
      rel: 0,
      showinfo: 0,
    },
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Поиск музыки */}
      <MusicSearch onTrackSelect={handleTrackSelect} />

      <Card className="bg-gradient-highlight border-gothic-accent shadow-gothic p-6">
        {/* Скрытый YouTube плеер */}
        {currentTrack && (
          <div style={{ display: 'none' }}>
            <YouTube
              videoId={currentTrack.videoId}
              opts={opts}
              onReady={onPlayerReady}
              onStateChange={onPlayerStateChange}
            />
          </div>
        )}

        {/* Track Info */}
        <div className="text-center mb-6">
          {currentTrack ? (
            <>
              <h3 className="text-lg font-semibold text-gothic-highlight mb-1">
                {currentTrack.title.slice(0, 40)}
                {currentTrack.title.length > 40 && "..."}
              </h3>
              <p className="text-sm text-muted-foreground">
                {currentTrack.artist}
              </p>
            </>
          ) : (
            <>
              <h3 className="text-lg font-semibold text-gothic-highlight mb-1">
                Погружение в бездну
              </h3>
              <p className="text-sm text-muted-foreground">
                Нажмите воспроизведение для случайного трека
              </p>
            </>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={1}
            onValueChange={handleProgressChange}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <Button
            variant="gothic"
            size="sm"
            onClick={prevTrack}
            className="w-10 h-10 p-0"
          >
            <SkipBack className="w-4 h-4" />
          </Button>

          <Button
            variant="hero"
            size="lg"
            onClick={togglePlay}
            className="w-14 h-14 p-0 rounded-full"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6" />
            )}
          </Button>

          <Button
            variant="gothic"
            size="sm"
            onClick={nextTrack}
            className="w-10 h-10 p-0"
          >
            <SkipForward className="w-4 h-4" />
          </Button>
        </div>

        {/* Library Controls */}
        {user && currentTrack && (
          <div className="flex justify-center gap-2 mb-4">
            <Button
              variant={isInLibrary ? "destructive" : "gothic"}
              size="sm"
              onClick={isInLibrary ? removeFromLibrary : addToLibrary}
              className="w-10 h-10 p-0"
            >
              {isInLibrary ? (
                <Minus className="w-4 h-4" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
            </Button>
          </div>
        )}

        {/* Volume Control */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleMute}
            className="w-8 h-8 p-0"
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-muted-foreground" />
            ) : (
              <Volume2 className="w-4 h-4 text-gothic-glow" />
            )}
          </Button>
          <Slider
            value={isMuted ? [0] : volume}
            max={100}
            step={1}
            onValueChange={handleVolumeChange}
            className="flex-1"
          />
        </div>

        {/* Status */}
        <div className="mt-6 pt-4 border-t border-gothic-accent">
          <p className="text-xs text-muted-foreground text-center">
            {currentTrack ? "Воспроизводится" : "Готов к погружению"}
          </p>
        </div>
      </Card>
    </div>
  );
};

export default MusicPlayer;