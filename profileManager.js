/*
  This script provides functions to manage user profiles in the student feedback system.
  It centralizes the profile fetching and auto-fill logic.
*/

import { SUPABASE_URL, SUPABASE_ANON_KEY } from './supabaseConfig.js';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Fetch user profile from database or user metadata
export async function fetchUserProfile() {
  try {
    // Get current user session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.log('No active session found');
      return null;
    }
      // First try to get data from user metadata (this is faster)
    const userData = session.user.user_metadata || {};
    
    // Check if we have complete profile in metadata
    if (userData.name && userData.branch && userData.semester) {
      console.log('Complete profile found in user metadata');
      return {
        name: userData.name,
        branch: userData.branch,
        semester: userData.semester,
        usn: userData.usn,
        email: session.user.email,
        userId: session.user.id
      };
    }
    
    // If metadata is incomplete, fetch from database
    console.log('Fetching profile from database');
    const { data: profileData, error } = await supabase
      .from('student_profiles')
      .select('*')
      .eq('user_id', session.user.id)
      .single();
    
    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    
    if (profileData) {
      console.log('Profile found in database');
      
      // Update user metadata for faster access next time
      await supabase.auth.updateUser({
        data: {
          name: profileData.name,
          branch: profileData.branch,
          semester: profileData.semester,
          usn: profileData.usn
        }
      });
        return {
        name: profileData.name,
        branch: profileData.branch,
        semester: profileData.semester,
        usn: profileData.usn,
        email: session.user.email,
        userId: session.user.id
      };
    }
    
    console.log('No profile found');
    return null;
    
  } catch (error) {
    console.error('Profile fetch error:', error);
    return null;
  }
}

// Auto-fill form fields with user profile data
export async function autoFillFormFields() {
  const profile = await fetchUserProfile();
  
  if (!profile) {
    console.log('No profile to auto-fill');
    return false;
  }
  
  // Try to find common form fields to populate
  const nameField = document.getElementById('name');
  const branchField = document.getElementById('branch');
  const semField = document.getElementById('sem') || document.getElementById('semester');
  const usnField = document.getElementById('usn');
  
  // Populate fields if they exist
  if (nameField) nameField.value = profile.name || '';
  if (branchField) branchField.value = profile.branch || '';
  if (semField) semField.value = profile.semester || '';
  if (usnField) usnField.value = profile.usn || '';
  
  return true;
}
