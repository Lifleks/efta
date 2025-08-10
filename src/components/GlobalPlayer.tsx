import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { usePlayer } from "@/contexts/PlayerContext";
import YouTube from "react-youtube";

const GlobalPlayer = () => {
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

  if (!currentTrack) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 glass-panel border-t transform transition-all duration-500 hover:scale-[1.01] hover:shadow-[0_0_30px_hsl(var(--gothic-glow)/0.4)] animate-slide-in-up">
      {/* Скрытый YouTube плеер */}
      <div style={{ display: 'none' }}>
        <YouTube
          videoId={currentTrack.videoId}
          opts={opts}
          onReady={onPlayerReady}
          onStateChange={onPlayerStateChange}
        />
      </div>

      <Card className="bg-transparent border-0 shadow-none rounded-none p-4 transform-gpu">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4">
            {/* Track Info */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {currentTrack.thumbnail && (
                <img
                  src={currentTrack.thumbnail}
                  alt={currentTrack.title}
                  className="w-12 h-12 rounded object-cover"
                />
              )}
              <div className="min-w-0 flex-1">
                <h4 className="font-medium text-foreground truncate text-sm">
                  {currentTrack.title.slice(0, 40)}
                  {currentTrack.title.length > 40 && "..."}
                </h4>
                <p className="text-xs text-muted-foreground truncate">
                  {currentTrack.artist}
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={prevTrack}
                className="w-8 h-8 p-0"
              >
                <SkipBack className="w-4 h-4" />
              </Button>

              <Button
                variant="hero"
                size="sm"
                onClick={togglePlay}
                className="w-10 h-10 p-0 rounded-full transition-all duration-300 hover:scale-110 hover:shadow-glow animate-pulse"
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 transition-all duration-200" />
                ) : (
                  <Play className="w-4 h-4 transition-all duration-200" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={nextTrack}
                className="w-8 h-8 p-0"
              >
                <SkipForward className="w-4 h-4" />
              </Button>
            </div>

            {/* Library Controls */}
            {user && (
              <Button
                variant={isInLibrary ? "destructive" : "ghost"}
                size="sm"
                onClick={isInLibrary ? removeFromLibrary : addToLibrary}
                className="w-8 h-8 p-0 transition-all duration-300 hover:scale-110"
              >
                {isInLibrary ? (
                  <Minus className="w-4 h-4 transition-transform duration-200 hover:rotate-90" />
                ) : (
                  <Plus className="w-4 h-4 transition-transform duration-200 hover:rotate-90" />
                )}
              </Button>
            )}

            {/* Volume Control */}
            <div className="flex items-center gap-2 w-24">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMute}
                className="w-6 h-6 p-0"
              >
                {isMuted ? (
                  <VolumeX className="w-3 h-3 text-muted-foreground" />
                ) : (
                  <Volume2 className="w-3 h-3 text-gothic-glow" />
                )}
              </Button>
              <Slider
                value={isMuted ? [0] : volume}
                max={100}
                step={1}
                onValueChange={handleVolumeChange}
                className="w-16"
              />
            </div>

            {/* Time */}
            <div className="text-xs text-muted-foreground min-w-0 w-16 text-right">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-3">
            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={1}
              onValueChange={handleProgressChange}
              className="w-full"
            />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default GlobalPlayer;