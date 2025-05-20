-- This SQL script sets up the necessary tables and policies for the VVCE Student Feedback Form
-- Run this in your Supabase SQL Editor to create the required database structure

-- Create extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create student_profiles table
CREATE TABLE IF NOT EXISTS student_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    usn TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    branch TEXT NOT NULL,
    semester INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create student_feedback table
CREATE TABLE IF NOT EXISTS student_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    branch TEXT NOT NULL,
    sem INTEGER NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Set up Row Level Security (RLS)

-- Enable RLS on tables
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_feedback ENABLE ROW LEVEL SECURITY;

-- Student profiles policies
CREATE POLICY "Users can view own profile"
    ON student_profiles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
    ON student_profiles FOR UPDATE
    USING (auth.uid() = user_id);

-- Allow any authenticated user to insert their own profile
-- This is critical for new user registration
CREATE POLICY "Users can insert own profile"
    ON student_profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id OR auth.role() = 'authenticated');

-- Allow service role to insert profiles for new users  
CREATE POLICY "Service role can insert profiles"
    ON student_profiles FOR INSERT
    WITH CHECK (true);

-- Student feedback policies
-- Allow authenticated users to insert feedback
CREATE POLICY "Users can insert own feedback"
    ON student_feedback FOR INSERT
    WITH CHECK (auth.uid() = user_id OR auth.role() = 'authenticated');

-- Allow users to view their own feedback
CREATE POLICY "Users can view own feedback"
    ON student_feedback FOR SELECT
    USING (auth.uid() = user_id);

-- Allow everyone to view all feedback (for the Recent Feedback section)
CREATE POLICY "Users can view all feedback"
    ON student_feedback FOR SELECT
    USING (true);
    
-- Allow service role to insert feedback
CREATE POLICY "Service role can manage feedback"
    ON student_feedback 
    USING (true);
    
-- Bypass RLS for student_feedback table (in case policies aren't working properly)
ALTER TABLE student_feedback FORCE ROW LEVEL SECURITY;
ALTER TABLE student_feedback ENABLE ROW LEVEL SECURITY;

-- Create a function to handle user registration
CREATE OR REPLACE FUNCTION handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  -- Check if a profile doesn't already exist
  IF NOT EXISTS (SELECT 1 FROM student_profiles WHERE user_id = NEW.id) THEN
    -- Create a default profile if metadata exists
    IF NEW.raw_user_meta_data ? 'name' AND 
       NEW.raw_user_meta_data ? 'branch' AND 
       NEW.raw_user_meta_data ? 'usn' THEN
      
      INSERT INTO student_profiles (user_id, name, branch, semester, usn)
      VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'name',
        NEW.raw_user_meta_data->>'branch',
        (NEW.raw_user_meta_data->>'semester')::integer,
        NEW.raw_user_meta_data->>'usn'
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to automatically create profiles for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
