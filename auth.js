/*
  This script handles authentication functionality for the student feedback system.
  It manages login, registration, and session management using Supabase Auth.
  Requires: supabase-js (loaded via CDN in HTML files)
*/

import { SUPABASE_URL, SUPABASE_ANON_KEY } from './supabaseConfig.js';

// Initialize the Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Check if user is already logged in
document.addEventListener('DOMContentLoaded', async () => {
  const { data: { session } } = await supabase.auth.getSession();
  
  // If we're on the login page and user is already logged in, redirect to index.html
  if (session && window.location.pathname.includes('login.html')) {
    window.location.href = 'index.html';
    return;
  }
  // Setup form event listeners based on the current page
  if (document.getElementById('login-form')) {
    setupLoginForm();
  }
  
  // Add logout handler if on main page
  const logoutButton = document.getElementById('logout-btn');
  if (logoutButton) {
    logoutButton.addEventListener('click', handleLogout);
  }
});

// Setup login form submission handler
function setupLoginForm() {
  const loginForm = document.getElementById('login-form');
  const loginStatus = document.getElementById('login-status');

  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    
    // Clear previous status message
    loginStatus.style.display = 'none';
    loginStatus.textContent = '';
    
    const usn = loginForm.usn.value.trim().toUpperCase();
    const password = loginForm.password.value;
    
    if (!usn || !password) {
      showStatus('Please enter both USN and password.', false);
      return;
    }
      // Format the email according to VVCE standards: vvce23cse0233@vvce.ac.in
    let email = '';
    
    // If the user already entered a full email, use it directly
    if (usn.includes('@')) {
      email = usn;
    } else {
      // Extract components from USN (e.g., 4VV23CS115)
      const yearMatch = usn.match(/4VV(\d{2})([A-Z]{2})(\d{3})/);
      if (yearMatch) {
        const year = yearMatch[1];
        let dept = yearMatch[2].toLowerCase();
        const number = yearMatch[3].padStart(4, '0');
        
        // Map department codes to their email format equivalents
        if (dept === 'cs') dept = 'cse';
        else if (dept === 'is') dept = 'ise';
        else if (dept === 'ec') dept = 'ece';
        else if (dept === 'ee') dept = 'eee';
        
        // Create the email in format: vvce23cse0233@vvce.ac.in
        email = `vvce${year}${dept}${number}@vvce.ac.in`;
      } else {
        // Fallback if USN format doesn't match expected pattern
        email = `${usn.toLowerCase()}@vvce.ac.in`;
      }
    }
    
    console.log('Login with email:', email);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      });
      
      if (error) throw error;
      
      showStatus('Login successful! Redirecting...', true);
      
      // Redirect to main page after a short delay
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1000);
      
    } catch (error) {
      showStatus(`Login failed: ${error.message}`, false);
    }
  });
}

// Handle user logout
async function handleLogout() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    // Redirect to login page
    window.location.href = 'login.html';
  } catch (error) {
    console.error('Error logging out:', error.message);
  }
}

// Display status message
function showStatus(message, isSuccess) {
  const statusElement = document.getElementById('login-status') || 
                        document.getElementById('register-status') ||
                        document.getElementById('form-status');
  
  if (statusElement) {
    statusElement.textContent = message;
    statusElement.style.display = 'block';
    
    // Remove previous classes
    statusElement.classList.remove('success', 'error');
    
    // Add appropriate class
    if (isSuccess) {
      statusElement.classList.add('success');
    } else {
      statusElement.classList.add('error');
    }
  }
}

// Helper function to check if USN is valid
export function isValidUSN(usn) {
  // Basic validation for VVCE USN format: 4VV + 2-digit year + 2-letter branch code + 3-digit number
  // Example: 4VV19CS001
  const regex = /^4VV\d{2}[A-Z]{2}\d{3}$/;
  return regex.test(usn);
}

// Export functions to be used in other files
export { showStatus, handleLogout };
