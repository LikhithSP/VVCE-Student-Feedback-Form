# VVCE Student Feedback Form

A simple web app for collecting student feedback, using Supabase as the backend and deployable on Netlify.

## Features
- Collects name, branch, semester, and feedback message
- Stores feedback securely in a Supabase database
- Displays recent feedback entries
- Modern, responsive design

## Setup
1. **Clone or download this repository.**
2. **Create a Supabase project** and a table named `student_feedback` with columns:
   - `id` (int8, primary key, auto-increment)
   - `name` (text)
   - `branch` (text)
   - `sem` (text)
   - `message` (text)
   - `created_at` (timestamp, default: now())
3. **Enable Row Level Security (RLS) policies** to allow insert and select as needed.
4. **Update `supabaseConfig.js`** with your Supabase URL and anon key.
5. **Deploy to Netlify:**
   - Drag and drop your project folder to Netlify, or connect your GitHub repo.


## License
MIT
