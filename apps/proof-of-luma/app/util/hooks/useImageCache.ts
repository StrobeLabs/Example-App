/**
 * useImageCache Hook
 * 
 * This custom hook manages an image caching mechanism for efficient image loading and rendering.
 * It provides functionality to preload images and store them in a cache for quick access.
 * 
 * Features:
 * - Maintains a cache of loaded images using a React ref
 * - Provides a function to preload images based on their URLs
 * - Prevents redundant loading of already cached images
 * - Optimizes performance by reducing network requests for previously loaded images
 * 
 * @returns An object containing:
 *   - imageCache: A ref object holding the cache of loaded images
 *   - preloadImages: A function to preload and cache images based on provided picture data
 */

import { useRef, useCallback } from 'react';

interface ImageCache {
  [url: string]: HTMLImageElement;
}

export const useImageCache = () => {
  const imageCache = useRef<ImageCache>({});

  const preloadImages = useCallback((pictures: { url: string }[]) => {
    pictures.forEach((picture) => {
      if (!imageCache.current[picture.url]) {
        const img = new Image();
        img.src = picture.url;
        img.onload = () => {
          imageCache.current[picture.url] = img;
        };
      }
    });
  }, []);

  return { imageCache, preloadImages };
};