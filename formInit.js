// This script ensures feedback functionality works correctly
// It's designed to run after all other scripts are loaded

document.addEventListener('DOMContentLoaded', () => {
  // Wait a bit to ensure all other scripts are fully initialized
  setTimeout(() => {
    // Import required functions
    import('./feedback.js')
      .then(module => {
        console.log('✅ Feedback module loaded successfully');
        
        // Fetch and display entries
        module.fetchAndDisplayEntries();
        
        // Re-attach form submit event
        const form = document.getElementById('feedback-form');
        if (form) {
          console.log('📝 Form found, attaching submit event');
          
          // Remove any existing listeners to avoid duplicates
          const newForm = form.cloneNode(true);
          form.parentNode.replaceChild(newForm, form);
          
          // Add the event listener
          newForm.addEventListener('submit', event => {
            event.preventDefault();
            console.log('Form submitted, calling handleFormSubmit');
            module.handleFormSubmit(event);
          });
        } else {
          console.error('❌ Feedback form not found');
        }
      })
      .catch(err => {
        console.error('❌ Failed to load feedback module:', err);
      });
  }, 500); // Short delay to ensure DOM is fully ready
});
