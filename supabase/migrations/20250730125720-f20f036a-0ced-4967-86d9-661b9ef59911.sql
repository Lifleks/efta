-- Create table for downloaded tracks
CREATE TABLE public.downloaded_tracks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  video_id TEXT NOT NULL,
  title TEXT NOT NULL,
  artist TEXT,
  thumbnail_url TEXT,
  duration TEXT,
  audio_file_path TEXT NOT NULL,
  file_size INTEGER,
  downloaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, video_id)
);

-- Enable RLS
ALTER TABLE public.downloaded_tracks ENABLE ROW LEVEL SECURITY;

-- Create policies for downloaded tracks
CREATE POLICY "Users can view their own downloaded tracks" 
ON public.downloaded_tracks 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can add their own downloaded tracks" 
ON public.downloaded_tracks 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own downloaded tracks" 
ON public.downloaded_tracks 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create storage bucket for audio files
INSERT INTO storage.buckets (id, name, public) VALUES ('audio-files', 'audio-files', false);

-- Create storage policies for audio files
CREATE POLICY "Users can view their own audio files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'audio-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own audio files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'audio-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own audio files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'audio-files' AND auth.uid()::text = (storage.foldername(name))[1]);