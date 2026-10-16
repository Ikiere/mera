-- ==============================================================================
-- MERA TELEPROMPTER & STUDIO DATABASE SCHEMA (SUPABASE POSTGRESQL)
-- ==============================================================================
-- Migration: 20261016_init_mera_schema.sql
-- Description: Sets up profiles, scripts, recordings, user_settings, RLS policies,
--              automated user provisioning trigger, and storage buckets.
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. PROFILES TABLE (Linked directly to Supabase auth.users)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- ------------------------------------------------------------------------------
-- 2. USER SETTINGS TABLE (Prompter, Camera, Voice Tracking Preferences)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_settings (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    default_camera TEXT DEFAULT 'front' CHECK (default_camera IN ('front', 'back')),
    default_orientation TEXT DEFAULT 'portrait' CHECK (default_orientation IN ('portrait', 'landscape')),
    prompter_font_size INTEGER DEFAULT 24 CHECK (prompter_font_size BETWEEN 12 AND 48),
    prompter_opacity NUMERIC(3,2) DEFAULT 0.75 CHECK (prompter_opacity BETWEEN 0.1 AND 1.0),
    prompter_position TEXT DEFAULT 'top' CHECK (prompter_position IN ('top', 'middle', 'bottom')),
    prompter_layout TEXT DEFAULT 'overlay' CHECK (prompter_layout IN ('overlay', 'split')),
    tracking_sensitivity TEXT DEFAULT 'medium' CHECK (tracking_sensitivity IN ('low', 'medium', 'high')),
    pause_delay_ms INTEGER DEFAULT 1500,
    countdown_seconds INTEGER DEFAULT 3,
    default_preset_id TEXT DEFAULT 'tiktok_reels',
    speech_locale TEXT DEFAULT 'en-US',
    speaking_rate_wpm INTEGER DEFAULT 140,
    has_completed_onboarding BOOLEAN DEFAULT false,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- User Settings Policies
CREATE POLICY "Users can view their own settings"
    ON public.user_settings FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings"
    ON public.user_settings FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
    ON public.user_settings FOR UPDATE
    USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 3. SCRIPTS TABLE (Teleprompter Scripts & Speech Transcripts)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.scripts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    word_count INTEGER DEFAULT 0 NOT NULL,
    estimated_duration_sec INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_scripts_user_id ON public.scripts(user_id);
CREATE INDEX IF NOT EXISTS idx_scripts_updated_at ON public.scripts(updated_at DESC);

-- Enable RLS
ALTER TABLE public.scripts ENABLE ROW LEVEL SECURITY;

-- Scripts Policies
CREATE POLICY "Users can view their own scripts"
    ON public.scripts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own scripts"
    ON public.scripts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scripts"
    ON public.scripts FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scripts"
    ON public.scripts FOR DELETE
    USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 4. RECORDINGS TABLE (Talking-Head Video Metadata & Cloud Sync)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.recordings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    script_id UUID REFERENCES public.scripts(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    video_url TEXT,
    thumbnail_url TEXT,
    duration_sec INTEGER DEFAULT 0 NOT NULL,
    file_size_bytes BIGINT DEFAULT 0 NOT NULL,
    preset_used TEXT DEFAULT 'tiktok_reels' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_recordings_user_id ON public.recordings(user_id);
CREATE INDEX IF NOT EXISTS idx_recordings_created_at ON public.recordings(created_at DESC);

-- Enable RLS
ALTER TABLE public.recordings ENABLE ROW LEVEL SECURITY;

-- Recordings Policies
CREATE POLICY "Users can view their own recordings"
    ON public.recordings FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own recordings"
    ON public.recordings FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recordings"
    ON public.recordings FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recordings"
    ON public.recordings FOR DELETE
    USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 5. AUTOMATIC PROFILE & SETTINGS PROVISIONING TRIGGER
-- ------------------------------------------------------------------------------
-- Automatically creates a profile and default settings entry when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
    );

    INSERT INTO public.user_settings (user_id)
    VALUES (NEW.id);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger definition
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------------------------------------------
-- 6. STORAGE BUCKETS (Optional: for cloud recording backups & thumbnails)
-- ------------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('recordings', 'recordings', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('thumbnails', 'thumbnails', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies
CREATE POLICY "Users can upload their own recordings"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'recordings' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can access their own recordings"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'recordings' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Public thumbnails read"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'thumbnails');

CREATE POLICY "Users can upload thumbnails"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'thumbnails' AND auth.role() = 'authenticated');
