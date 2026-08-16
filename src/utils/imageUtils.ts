import React from 'react';

/**
 * Utility function for handling image loading errors across all portfolio components.
 * Tries multiple fallback paths in sequence (e.g., ./images/filename, /images/filename, ./src/assets/images/filename),
 * stripping any Vite bundle hashes if present, and providing a clean SVG placeholder if all paths fail.
 */
export function handleImageError(
  event: React.SyntheticEvent<HTMLImageElement, Event>,
  fallbackFilename: string = 'MAIN.jpg'
) {
  const target = event.currentTarget;
  const currentIndex = parseInt(target.dataset.fallbackIndex || '0', 10);

  // Extract raw filename from dataset attribute or current src
  let rawFilename =
    target.dataset.filename ||
    target.src.split('/').pop()?.split('?')[0] ||
    fallbackFilename;

  // Clean Vite hash (e.g., "MAIN-D1tIUrrv.jpg" -> "MAIN.jpg")
  const cleanFilename =
    rawFilename.replace(/-[A-Za-z0-9_-]{8}\.([a-zA-Z0-9]+)$/, '.$1') ||
    fallbackFilename;

  const fallbackCandidatePaths = [
    `./images/${cleanFilename}`,
    `/images/${cleanFilename}`,
    `images/${cleanFilename}`,
    `./src/assets/images/${cleanFilename}`,
    `/src/assets/images/${cleanFilename}`,
    `./images/${fallbackFilename}`,
    `/images/${fallbackFilename}`,
  ];

  if (currentIndex < fallbackCandidatePaths.length) {
    target.dataset.fallbackIndex = (currentIndex + 1).toString();
    target.src = fallbackCandidatePaths[currentIndex];
  } else {
    // Render clean SVG placeholder as final fallback
    target.src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="%2310b981" stroke-width="1.5"><rect width="18" height="18" x="3" y="3" rx="3"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>`;
  }
}

