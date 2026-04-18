-- FITLIFE Supabase Schema

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid references auth.users(id) primary key,
  email text,
  name text,
  age numeric,
  gender text,
  height_cm numeric,
  weight_kg numeric,
  goal_weight_kg numeric,
  fitness_level text,
  goal_type text,
  activity text,
  dietary_preference text,
  allergies text[],
  budget text,
  created_at timestamptz default now(),
  last_login timestamptz default now()
);

-- Enable RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Create workout_logs table
CREATE TABLE IF NOT EXISTS public.workout_logs (
  id uuid primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  date date,
  exercise_name text,
  sets integer,
  reps integer,
  weight_kg numeric,
  duration_min integer,
  calories_burned numeric,
  notes text
);

-- Enable RLS for workout_logs
ALTER TABLE public.workout_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their workout logs" ON public.workout_logs FOR ALL USING (auth.uid() = user_id);

-- Create meal_logs table
CREATE TABLE IF NOT EXISTS public.meal_logs (
  id uuid primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  date date,
  meal_type text,
  food_items text,
  calories numeric,
  protein_g numeric,
  carbs_g numeric,
  fat_g numeric
);

-- Enable RLS for meal_logs
ALTER TABLE public.meal_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their meal logs" ON public.meal_logs FOR ALL USING (auth.uid() = user_id);

-- Create progress_entries table
CREATE TABLE IF NOT EXISTS public.progress_entries (
  id uuid primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  date date,
  weight_kg numeric,
  body_fat_pct numeric,
  chest_cm numeric,
  waist_cm numeric,
  hips_cm numeric,
  arms_cm numeric,
  thighs_cm numeric,
  photo_url text
);

-- Enable RLS for progress_entries
ALTER TABLE public.progress_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their progress entries" ON public.progress_entries FOR ALL USING (auth.uid() = user_id);

-- Create daily_water table
CREATE TABLE IF NOT EXISTS public.daily_water (
  user_id uuid references public.profiles(id) on delete cascade,
  date date,
  water_ml integer,
  primary key (user_id, date)
);

-- Enable RLS for daily_water
ALTER TABLE public.daily_water ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their daily water" ON public.daily_water FOR ALL USING (auth.uid() = user_id);

-- Create user_badges table
CREATE TABLE IF NOT EXISTS public.user_badges (
  user_id uuid references public.profiles(id) on delete cascade,
  badge_id text,
  primary key (user_id, badge_id)
);

-- Enable RLS for user_badges
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their badges" ON public.user_badges FOR ALL USING (auth.uid() = user_id);

-- Create personal_records table
CREATE TABLE IF NOT EXISTS public.personal_records (
  user_id uuid references public.profiles(id) on delete cascade,
  exercise_name text,
  weight_kg numeric,
  primary key (user_id, exercise_name)
);

-- Enable RLS for personal_records
ALTER TABLE public.personal_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their PRs" ON public.personal_records FOR ALL USING (auth.uid() = user_id);
