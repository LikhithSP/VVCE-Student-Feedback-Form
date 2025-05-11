/*
  This script handles the feedback form submission and fetches feedback entries from Supabase.
  Requires: supabase-js (loaded via CDN in index.html)
*/

import { SUPABASE_URL, SUPABASE_ANON_KEY } from './supabaseConfig.js';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Handle form submission
export async function handleFormSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const name = form.name.value.trim();
  const branch = form.branch.value.trim();
  const sem = form.sem.value.trim();
  const message = form.message.value.trim();

  if (!name || !branch || !sem || !message) {
    showStatus('Please fill in all fields.', false);
    return;
  }

  const { error } = await supabase.from('student_feedback').insert([
    { name, branch, sem, message }
  ]);

  if (error) {
    showStatus('Error submitting feedback. Please try again.', false);
  } else {
    showStatus('Feedback submitted! Thank you for your response.', true);
    form.reset();
    fetchAndDisplayEntries();
  }
}

// Fetch and display feedback entries
export async function fetchAndDisplayEntries() {
  const entriesDiv = document.querySelector('.entries');
  if (!entriesDiv) return;
  const { data, error } = await supabase
    .from('student_feedback')
    .select('name, branch, sem, message, created_at')
    .order('id', { ascending: false })
    .limit(30);

  if (error) {
    entriesDiv.innerHTML = '<div style="color:red;">Error loading feedback entries.</div>';
    return;
  }

  if (!data || data.length === 0) {
    entriesDiv.innerHTML = '<div style="color:#888;">No feedback entries yet.</div>';
    return;
  }

  entriesDiv.innerHTML = data.map(entry => `
    <div class="entry">
      <div class="name">${escapeHtml(entry.name)} <span style="font-weight:400;color:#555;font-size:0.95em;">(${escapeHtml(entry.branch)}, Sem ${escapeHtml(entry.sem)})</span></div>
      <div class="message">${escapeHtml(entry.message)}</div>
      <div class="date">${formatDate(entry.created_at)}</div>
    </div>
  `).join('');
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
    document.querySelector('.feedback-sheet').insertBefore(statusDiv, document.querySelector('form'));
  }
  statusDiv.textContent = message;
  statusDiv.style.background = success ? '#e6f9ea' : '#ffeaea';
  statusDiv.style.color = success ? '#217a3c' : '#b91c1c';
  statusDiv.style.padding = '12px 0 10px 0';
}

function escapeHtml(text) {
  return text.replace(/[&<>"]/g, function(m) {
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]);
  });
}

function formatDate(dateString) {
  const d = new Date(dateString);
  return d.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
}

// On page load
window.addEventListener('DOMContentLoaded', () => {
  fetchAndDisplayEntries();
  const form = document.querySelector('form');
  if (form) {
    form.addEventListener('submit', handleFormSubmit);
  }
});
