// Theme toggler functionality
document.addEventListener('DOMContentLoaded', () => {
  const themeToggle = document.getElementById('theme-toggle');
  
  // Check for saved theme preference or respect OS setting
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const savedTheme = localStorage.getItem('theme');
  
  // Apply initial theme
  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    setDarkMode();
  } else {
    setLightMode();
  }
  
  // Handle toggle button click
  themeToggle.addEventListener('click', () => {
    if (document.documentElement.getAttribute('data-theme') === 'dark') {
      setLightMode();
    } else {
      setDarkMode();
    }
    
    // Add animation effect to the toggle button
    themeToggle.classList.add('theme-toggle-clicked');
    setTimeout(() => {
      themeToggle.classList.remove('theme-toggle-clicked');
    }, 300);
  });
  
  function setDarkMode() {
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('theme', 'dark');
  }
  
  function setLightMode() {
    document.documentElement.setAttribute('data-theme', 'light');
    localStorage.setItem('theme', 'light');
  }
  
  // Handle system preference changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (!localStorage.getItem('theme')) {
      if (e.matches) {
        setDarkMode();
      } else {
        setLightMode();
      }
    }
  });
});
