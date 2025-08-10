import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Play } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface YouTubeVideo {
  id: {
    videoId: string;
  };
  snippet: {
    title: string;
    channelTitle: string;
    thumbnails: {
      default: {
        url: string;
      };
    };
  };
}

interface SearchResult {
  videoId: string;
  title: string;
  artist: string;
  thumbnail: string;
}

interface MusicSearchProps {
  onTrackSelect: (track: SearchResult) => void;
}

const MusicSearch = ({ onTrackSelect }: MusicSearchProps) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout>();

  // YouTube API key - в продакшене это должно быть в переменных окружения
  const YOUTUBE_API_KEY = "AIzaSyB_t3uhf9i8Mdx7lFPTPmkV7sesONyu9y4"; // Замените на ваш API ключ

  const searchYouTube = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=${encodeURIComponent(
          searchQuery
        )}&type=video&key=${YOUTUBE_API_KEY}`
      );
      
      const data = await response.json();
      
      if (data.items) {
        const searchResults: SearchResult[] = data.items.map((item: YouTubeVideo) => ({
          videoId: item.id.videoId,
          title: item.snippet.title,
          artist: item.snippet.channelTitle,
          thumbnail: item.snippet.thumbnails.default.url
        }));
        
        setResults(searchResults);
        setShowResults(true);
      }
    } catch (error) {
      console.error("Error searching YouTube:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(() => {
      searchYouTube(query);
    }, 500);

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [query]);

  const handleTrackSelect = (track: SearchResult) => {
    onTrackSelect(track);
    setShowResults(false);
    setQuery("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="relative w-full max-w-md mx-auto mb-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск музыки..."
          className="pl-10 bg-background/50 border-gothic-accent focus:border-gothic-glow"
          onFocus={() => query && setShowResults(true)}
          onKeyPress={handleKeyPress}
        />
      </div>

      {showResults && (
        <Card className="absolute top-full left-0 right-0 mt-2 max-h-80 overflow-y-auto bg-background/95 backdrop-blur-sm border-gothic-accent shadow-gothic z-10">
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground">
              Поиск...
            </div>
          ) : results.length > 0 ? (
            <div className="p-2">
              {results.map((track) => (
                <div
                  key={track.videoId}
                  className="flex items-center gap-3 p-3 hover:bg-gothic-accent/10 rounded-lg cursor-pointer transition-colors"
                  onClick={() => handleTrackSelect(track)}
                >
                  <img
                    src={track.thumbnail}
                    alt={track.title}
                    className="w-12 h-12 rounded object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-foreground truncate text-sm">
                      {track.title.slice(0, 50)}
                      {track.title.length > 50 && "..."}
                    </h4>
                    <p className="text-sm text-muted-foreground truncate">
                      {track.artist}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="shrink-0 w-8 h-8 p-0"
                  >
                    <Play className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : query && !isLoading ? (
            <div className="p-4 text-center text-muted-foreground">
              Ничего не найдено
            </div>
          ) : null}
        </Card>
      )}
    </div>
  );
};

export default MusicSearch;