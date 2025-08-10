-- Add tag field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN tag TEXT UNIQUE;

-- Create index for better search performance
CREATE INDEX idx_profiles_tag ON public.profiles(tag);

-- Add constraint to ensure tag is not empty when set
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_tag_check CHECK (tag IS NULL OR length(trim(tag)) > 0);