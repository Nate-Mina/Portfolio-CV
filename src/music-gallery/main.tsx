import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Guard against third-party cross-origin script errors (e.g. YouTube iframe postMessage or media autoplay restrictions)
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    // Suppress cross-origin script errors or empty errors that originate from external scripts
    if (!event.message || event.message === 'Script error.' || (event.filename && (event.filename.includes('youtube.com') || event.filename.includes('suno.ai')))) {
      event.preventDefault();
      return true;
    }
  });

  window.addEventListener('unhandledrejection', (event) => {
    // Suppress audio/video autoplay restrictions or aborted play requests
    if (event.reason) {
      const name = event.reason?.name || '';
      const msg = String(event.reason?.message || event.reason || '');
      if (name === 'AbortError' || name === 'NotAllowedError' || msg.includes('play()') || msg.includes('interact')) {
        event.preventDefault();
        return;
      }
    }
    // Suppress empty unhandled rejections
    if (!event.reason) {
      event.preventDefault();
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);


