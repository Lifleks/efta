-- Create listening history table
CREATE TABLE public.listening_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  video_id TEXT NOT NULL,
  title TEXT NOT NULL,
  artist TEXT,
  thumbnail_url TEXT,
  duration TEXT,
  played_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.listening_history ENABLE ROW LEVEL SECURITY;

-- Create policies for listening history
CREATE POLICY "Users can view their own listening history" 
ON public.listening_history 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can add to their own listening history" 
ON public.listening_history 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX idx_listening_history_user_played_at ON public.listening_history(user_id, played_at DESC);