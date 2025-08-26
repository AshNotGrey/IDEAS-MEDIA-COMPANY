import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Custom hook for managing keyboard shortcuts in the Admin PWA
 */
export const useKeyboardShortcuts = () => {
  const navigate = useNavigate();

  const handleKeyDown = useCallback((event) => {
    // Only handle shortcuts when not in an input field
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA' || event.target.isContentEditable) {
      return;
    }

    const { key, ctrlKey, metaKey, altKey, shiftKey } = event;
    const isModifier = ctrlKey || metaKey;

    // Navigation shortcuts
    if (isModifier && !altKey && !shiftKey) {
      switch (key) {
        case '1':
          event.preventDefault();
          navigate('/dashboard');
          break;
        case '2':
          event.preventDefault();
          navigate('/users');
          break;
        case '3':
          event.preventDefault();
          navigate('/bookings');
          break;
        case '4':
          event.preventDefault();
          navigate('/services');
          break;
        case '5':
          event.preventDefault();
          navigate('/analytics');
          break;
        case '6':
          event.preventDefault();
          navigate('/media');
          break;
        case '7':
          event.preventDefault();
          navigate('/email-templates');
          break;
        case '8':
          event.preventDefault();
          navigate('/settings');
          break;
        case 'h':
          event.preventDefault();
          navigate('/dashboard');
          break;
        default:
          break;
      }
    }

    // Quick actions with Alt modifier
    if (altKey && !ctrlKey && !metaKey && !shiftKey) {
      switch (key) {
        case 'n':
          // New item - context dependent
          event.preventDefault();
          console.log('Quick new item shortcut');
          break;
        case 'r':
          // Refresh current page
          event.preventDefault();
          window.location.reload();
          break;
        case 't':
          // Toggle theme
          event.preventDefault();
          document.documentElement.classList.toggle('dark');
          break;
        default:
          break;
      }
    }

    // Single key shortcuts (when not in input)
    if (!isModifier && !altKey && !shiftKey) {
      switch (key) {
        case '?':
          // Show keyboard shortcuts help
          event.preventDefault();
          showShortcutsHelp();
          break;
        default:
          break;
      }
    }
  }, [navigate]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return null;
};

// Show keyboard shortcuts help modal
const showShortcutsHelp = () => {
  // Create and show a modal with keyboard shortcuts
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4';
  
  modal.innerHTML = `
    <div class="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full p-6">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Keyboard Shortcuts</h3>
        <button id="close-shortcuts" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
      
      <div class="space-y-4">
        <div>
          <h4 class="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Navigation</h4>
          <div class="space-y-1 text-sm text-gray-600 dark:text-gray-400">
            <div class="flex justify-between">
              <span>Dashboard</span>
              <kbd class="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">⌘1</kbd>
            </div>
            <div class="flex justify-between">
              <span>Users</span>
              <kbd class="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">⌘2</kbd>
            </div>
            <div class="flex justify-between">
              <span>Bookings</span>
              <kbd class="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">⌘3</kbd>
            </div>
            <div class="flex justify-between">
              <span>Services</span>
              <kbd class="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">⌘4</kbd>
            </div>
            <div class="flex justify-between">
              <span>Analytics</span>
              <kbd class="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">⌘5</kbd>
            </div>
            <div class="flex justify-between">
              <span>Media</span>
              <kbd class="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">⌘6</kbd>
            </div>
            <div class="flex justify-between">
              <span>Email Templates</span>
              <kbd class="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">⌘7</kbd>
            </div>
            <div class="flex justify-between">
              <span>Settings</span>
              <kbd class="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">⌘8</kbd>
            </div>
          </div>
        </div>
        
        <div>
          <h4 class="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Actions</h4>
          <div class="space-y-1 text-sm text-gray-600 dark:text-gray-400">
            <div class="flex justify-between">
              <span>Search</span>
              <kbd class="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">⌘K</kbd>
            </div>
            <div class="flex justify-between">
              <span>New Item</span>
              <kbd class="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">Alt+N</kbd>
            </div>
            <div class="flex justify-between">
              <span>Refresh</span>
              <kbd class="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">Alt+R</kbd>
            </div>
            <div class="flex justify-between">
              <span>Toggle Theme</span>
              <kbd class="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">Alt+T</kbd>
            </div>
            <div class="flex justify-between">
              <span>Show Shortcuts</span>
              <kbd class="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">?</kbd>
            </div>
          </div>
        </div>
      </div>
      
      <div class="mt-6 text-center">
        <button id="close-shortcuts-btn" class="px-4 py-2 bg-ideas-accent text-white rounded-lg hover:bg-ideas-accentHover transition-colors">
          Got it
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Close modal handlers
  const closeModal = () => {
    document.body.removeChild(modal);
  };
  
  modal.querySelector('#close-shortcuts').addEventListener('click', closeModal);
  modal.querySelector('#close-shortcuts-btn').addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
  
  // Close on escape key
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      closeModal();
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);
};

// Export keyboard shortcuts configuration
export const keyboardShortcuts = {
  navigation: {
    'Cmd+1': 'Dashboard',
    'Cmd+2': 'Users', 
    'Cmd+3': 'Bookings',
    'Cmd+4': 'Services',
    'Cmd+5': 'Analytics',
    'Cmd+6': 'Media',
    'Cmd+7': 'Email Templates',
    'Cmd+8': 'Settings',
    'Cmd+H': 'Home (Dashboard)'
  },
  actions: {
    'Cmd+K': 'Global Search',
    'Alt+N': 'New Item',
    'Alt+R': 'Refresh Page',
    'Alt+T': 'Toggle Theme',
    '?': 'Show Keyboard Shortcuts'
  }
};
