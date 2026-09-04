-- =========================================================
-- SpeakBand — Official Supabase Database & Auth Schema
-- Project: https://lrszgoijicnweqwbsspr.supabase.co
-- =========================================================

-- 1. Profiles Table (Student / Candidate metadata)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  target_band NUMERIC(2,1) DEFAULT 7.0,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by owner" ON public.profiles;
CREATE POLICY "Public profiles are viewable by owner" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert/update their own profile" ON public.profiles;
CREATE POLICY "Users can insert/update their own profile" 
ON public.profiles FOR ALL 
USING (auth.uid() = id) 
WITH CHECK (auth.uid() = id);

-- Automatically create profile on auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, created_at)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    now()
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      full_name = EXCLUDED.full_name,
      updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. IELTS Completed Tests Table
CREATE TABLE IF NOT EXISTS public.ielts_tests (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  overall_band NUMERIC(2,1) NOT NULL,
  fluency_band NUMERIC(2,1) NOT NULL,
  lexical_band NUMERIC(2,1) NOT NULL,
  grammar_band NUMERIC(2,1) NOT NULL,
  pronunciation_band NUMERIC(2,1) NOT NULL,
  test_duration_seconds INTEGER DEFAULT 0,
  weakest_skill TEXT,
  strongest_skill TEXT,
  summary TEXT,
  evaluation_data JSONB NOT NULL
);

ALTER TABLE public.ielts_tests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own IELTS tests" ON public.ielts_tests;
CREATE POLICY "Users can view own IELTS tests" 
ON public.ielts_tests FOR SELECT 
USING (auth.uid() = user_id OR auth.uid() IS NULL);

DROP POLICY IF EXISTS "Users can insert own IELTS tests" ON public.ielts_tests;
CREATE POLICY "Users can insert own IELTS tests" 
ON public.ielts_tests FOR INSERT 
WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

DROP POLICY IF EXISTS "Users can delete own IELTS tests" ON public.ielts_tests;
CREATE POLICY "Users can delete own IELTS tests" 
ON public.ielts_tests FOR DELETE 
USING (auth.uid() = user_id);

-- 3. Transcripts & Answer Review Table
CREATE TABLE IF NOT EXISTS public.ielts_transcripts (
  id TEXT PRIMARY KEY,
  test_id TEXT REFERENCES public.ielts_tests(id) ON DELETE CASCADE,
  part INTEGER NOT NULL,
  topic TEXT,
  question TEXT NOT NULL,
  candidate_answer TEXT NOT NULL,
  audio_url TEXT,
  better_version TEXT,
  feedback JSONB,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.ielts_transcripts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view transcripts for their tests" ON public.ielts_transcripts;
CREATE POLICY "Users can view transcripts for their tests"
ON public.ielts_transcripts FOR ALL
USING (true)
WITH CHECK (true);

-- 4. Personalized Practice Sessions Table
CREATE TABLE IF NOT EXISTS public.ielts_practice_sessions (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  drill_type TEXT NOT NULL,
  focus_skill TEXT NOT NULL,
  prompt TEXT NOT NULL,
  candidate_response TEXT,
  coach_feedback TEXT,
  band_indicator NUMERIC(2,1),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.ielts_practice_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can access own practice sessions" ON public.ielts_practice_sessions;
CREATE POLICY "Users can access own practice sessions"
ON public.ielts_practice_sessions FOR ALL
USING (auth.uid() = user_id OR auth.uid() IS NULL)
WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);
