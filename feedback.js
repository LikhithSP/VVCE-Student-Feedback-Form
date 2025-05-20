/*
  This script handles the feedback form submission and fetches feedback entries from Supabase.
  Requires: supabase-js (loaded via CDN in index.html)
*/

import { SUPABASE_URL, SUPABASE_ANON_KEY } from './supabaseConfig.js';
import { fetchUserProfile } from './profileManager.js';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Handle form submission
export async function handleFormSubmit(event) {
  event.preventDefault();
  console.log('Form submission started');
  
  const form = event.target;
  const message = form.message.value.trim();

  if (!message) {
    showStatus('Please enter your feedback message.', false);
    console.warn('Submission stopped: Empty message');
    return;
  }
  
  // Show status to user
  showStatus('Submitting your feedback...', true);
  
  try {
    // Get current user session directly
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      showStatus('You must be logged in to submit feedback.', false);
      console.error('No active session');
      setTimeout(() => { window.location.href = 'login.html'; }, 2000);
      return;
    }
    
    // Get user profile data from metadata or form
    const userData = session.user.user_metadata || {};
    
    // Get data from form fields (these should be auto-filled)
    let name = form.name.value.trim() || userData.name;
    let branch = form.branch.value.trim() || userData.branch;
    let sem = form.sem.value.trim() || userData.semester;
    
    // If data is missing, try to get from profile manager
    if (!name || !branch || !sem) {
      const profile = await fetchUserProfile();
      if (profile) {
        name = profile.name || name;
        branch = profile.branch || branch;
        sem = profile.semester || sem;
      }
    }
    
    // Final check for required data
    if (!name || !branch || !sem) {
      showStatus('Missing profile information. Please complete your profile.', false);
      console.warn('Missing profile data', { name, branch, sem });
      return;
    }
    
    // Submit the feedback with all necessary data
    console.log('Submitting feedback with:', { 
      name, 
      branch, 
      sem, 
      message, 
      user_id: session.user.id
    });
    
    const { error } = await supabase.from('student_feedback').insert([
      { name, branch, sem, message, user_id: session.user.id }
    ]);

    if (error) {
      console.error('Error submitting feedback:', error);
      showStatus('Error submitting feedback: ' + error.message, false);
    } else {
      console.log('Feedback submitted successfully!');
      showStatus('Feedback submitted! Thank you for your response.', true);
      form.reset();
      // Re-fill the form with user data
      if (userData) {
        form.name.value = userData.name || '';
        form.branch.value = userData.branch || '';
        form.sem.value = userData.semester || '';
      }
      // Refresh the entries display
      fetchAndDisplayEntries();
    }
  } catch (err) {
    console.error('Error in form submission:', err);
    showStatus('An unexpected error occurred. Please try again.', false);
  }
}

// Fetch and display feedback entries
export async function fetchAndDisplayEntries() {
  const entriesDiv = document.querySelector('.entries');
  if (!entriesDiv) {
    console.error('Could not find entries div');
    return;
  }
  
  console.log('Fetching feedback entries...');
  
  try {
    // Try to fetch all feedback entries
    const { data, error } = await supabase
      .from('student_feedback')
      .select('name, branch, sem, message, created_at')
      .order('id', { ascending: false })
      .limit(30);
  
    if (error) {
      console.error('Error fetching entries:', error);
      entriesDiv.innerHTML = `
        <div style="color:red;text-align:center;padding:20px;">
          Error loading feedback entries: ${error.message}
          <br><br>
          <button onclick="window.location.reload()" style="padding:8px 16px;background:#4299e1;color:white;border:none;border-radius:4px;cursor:pointer;">
            Refresh Page
          </button>
        </div>`;
      return;
    }
  
    console.log('Fetched entries:', data);
    
    if (!data || data.length === 0) {
      entriesDiv.innerHTML = '<div style="color:var(--text-muted);text-align:center;padding:20px;">No feedback entries yet.</div>';
      return;
    }
  
    entriesDiv.innerHTML = data.map(entry => `
      <div class="entry">
        <div class="name">${escapeHtml(entry.name)} <span style="font-weight:400;color:#555;font-size:0.95em;">(${escapeHtml(entry.branch)}, Sem ${escapeHtml(entry.sem)})</span></div>
        <div class="message">${escapeHtml(entry.message)}</div>
        <div class="date">${formatDate(entry.created_at)}</div>
      </div>
    `).join('');
    
    console.log('Entries rendered successfully');
  } catch (err) {
    console.error('Failed to fetch entries:', err);
    entriesDiv.innerHTML = `
      <div style="color:red;text-align:center;padding:20px;">
        Failed to load feedback entries. Please try again later.
        <br><br>
        <button onclick="window.location.reload()" style="padding:8px 16px;background:#4299e1;color:white;border:none;border-radius:4px;cursor:pointer;">
          Refresh Page
        </button>
      </div>`;
  }
}

function showStatus(message, success) {
  let statusDiv = document.getElementById('form-status');
  if (!statusDiv) {
    statusDiv = document.createElement('div');
    statusDiv.id = 'form-status';
    statusDiv.style.marginBottom = '18px';
    statusDiv.style.textAlign = 'center';
    statusDiv.style.borderRadius = '7px';
    statusDiv.style.fontWeight = '600';
    
    // Find the form and insert status before it
    const form = document.getElementById('feedback-form');
    const formPanel = document.querySelector('.form-panel');
    if (form && formPanel) {
      formPanel.insertBefore(statusDiv, form);
    } else {
      console.error('Could not find form or form-panel to insert status');
    }
  }
  statusDiv.textContent = message;
  statusDiv.style.display = 'block';
  statusDiv.style.background = success ? '#e6f9ea' : '#ffeaea';
  statusDiv.style.color = success ? '#217a3c' : '#b91c1c';
  statusDiv.style.padding = '12px 0 10px 0';
}

function escapeHtml(text) {
  if (text === null || text === undefined) return '';
  return String(text).replace(/[&<>"]/g, function(m) {
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]);
  });
}

function formatDate(dateString) {
  const d = new Date(dateString);
  return d.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
}

// On page load
window.addEventListener('DOMContentLoaded', () => {
  // First fetch and display existing entries
  fetchAndDisplayEntries();
  
  // Then set up the form submission handler
  const form = document.getElementById('feedback-form');
  if (form) {
    console.log('Adding submit event listener to form');
    form.addEventListener('submit', handleFormSubmit);
  } else {
    console.error('Could not find feedback form element');
  }
});
