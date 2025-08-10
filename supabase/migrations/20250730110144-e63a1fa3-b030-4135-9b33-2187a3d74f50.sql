-- Create user_library table for saved tracks
CREATE TABLE public.user_library (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  video_id TEXT NOT NULL,
  title TEXT NOT NULL,
  artist TEXT,
  thumbnail_url TEXT,
  duration TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, video_id)
);

-- Enable Row Level Security
ALTER TABLE public.user_library ENABLE ROW LEVEL SECURITY;

-- Create policies for user library
CREATE POLICY "Users can view their own library" 
ON public.user_library 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can add to their own library" 
ON public.user_library 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove from their own library" 
ON public.user_library 
FOR DELETE 
USING (auth.uid() = user_id);