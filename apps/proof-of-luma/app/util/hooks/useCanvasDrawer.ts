/**
 * useCanvasDrawer Hook
 * 
 * This custom hook manages the drawing and redrawing of images on a canvas element.
 * It provides a function to redraw the entire canvas, handling both static images and animated GIFs.
 * 
 * Features:
 * - Sorts pictures based on timestamp for proper layering
 * - Draws static images and animated GIFs
 * - Adds resize handles to each image
 * - Optimizes performance by using image caching
 * 
 * @param canvasRef - Reference to the canvas element
 * @param context - The 2D rendering context of the canvas
 * @param pictures - Array of Picture objects to be drawn
 * @param imageCache - Cached images for efficient rendering
 * @param handleGifAnimation - Function to handle GIF animations
 * 
 * @returns An object containing the redrawCanvas function
 */
import { useCallback } from 'react';
import { Picture } from '../../components/subsections/chat/canvas-view/CanvasView';

export const useCanvasDrawer = (
  canvasRef: React.RefObject<HTMLCanvasElement>,
  context: CanvasRenderingContext2D | null,
  pictures: Picture[],
  imageCache: React.MutableRefObject<Record<string, HTMLImageElement>>,
  handleGifAnimation: (context: CanvasRenderingContext2D, picture: Picture, img: HTMLImageElement, x: number, y: number, width: number, height: number) => void
) => {
  const redrawCanvas = useCallback(() => {
    if (!context || !canvasRef.current) return;
    const canvas = canvasRef.current;
    context.clearRect(0, 0, canvas.width, canvas.height);

    const sortedPictures = [...pictures].sort((a, b) => {
     // @ts-ignore
     return (b.timestamp?.nanoseconds ?? 0) - (a.timestamp?.nanoseconds ?? 0);
    });

    sortedPictures.forEach((picture) => {
      const img = imageCache.current[picture.url];
      if (img) {
        let { x, y, width, height } = picture;

        if (picture.url.endsWith(".gif")) {
          handleGifAnimation(context, picture, img, x, y, width, height);
        } else {
          context.drawImage(img, x, y, width, height);
        }

        // Draw resize handle
        context.fillStyle = "magenta";
        context.fillRect(x + width - 5, y + height - 5, 10, 10);
        context.strokeStyle = "magenta";
        context.strokeRect(x + width - 5, y + height - 5, 10, 10);
      }
    });
  }, [context, pictures, handleGifAnimation, imageCache]);

  return { redrawCanvas };
};