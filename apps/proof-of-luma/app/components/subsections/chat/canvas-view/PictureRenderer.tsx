import React from 'react';
import { Picture, DraggingPicture, ResizingPicture } from './CanvasView';

/**
 * PictureRenderer Component
 * 
 * This component is responsible for rendering pictures on a canvas element.
 * It handles the drawing of both static images and animated GIFs, as well as
 * the visual representation of dragging and resizing operations.
 * 
 * Features:
 * - Renders pictures in order based on their timestamp
 * - Supports dragging and resizing of pictures
 * - Handles GIF animations
 * - Draws resize handles for each picture
 * - Optimized to work directly with the canvas context
 * 
 * @param pictures - Array of Picture objects to be rendered
 * @param draggingPicture - Currently dragged picture, if any
 * @param resizingPicture - Currently resized picture, if any
 * @param imageCache - Reference to cached images for efficient rendering
 * @param handleGifAnimation - Function to handle GIF animations
 * @param context - The 2D rendering context of the canvas
 */

interface PictureRendererProps {
  pictures: Picture[];
  draggingPicture: DraggingPicture | null;
  resizingPicture: ResizingPicture | null;
  imageCache: React.MutableRefObject<Record<string, HTMLImageElement>>;
  handleGifAnimation: (context: CanvasRenderingContext2D, picture: Picture, img: HTMLImageElement, x: number, y: number, width: number, height: number) => void;
  context: CanvasRenderingContext2D | null;
}

export const PictureRenderer: React.FC<PictureRendererProps> = ({
  pictures,
  draggingPicture,
  resizingPicture,
  imageCache,
  handleGifAnimation,
  context,
}) => {
  if (!context) return null;

  const sortedPictures = [...pictures].sort((a, b) => {
    // @ts-ignore
    return (b.timestamp?.nanoseconds ?? 0) - (a.timestamp?.nanoseconds ?? 0);
  });

  return (
    <>
      {sortedPictures.map((picture) => {
        const img = imageCache.current[picture.url];
        if (!img) return null;

        let { x, y, width, height } = picture;
        if (draggingPicture && draggingPicture.id === picture.id) {
          ({ x, y, width, height } = draggingPicture);
        } else if (resizingPicture && resizingPicture.id === picture.id) {
          ({ x, y, width, height } = resizingPicture);
        }

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

        return null; // We're drawing directly on the canvas, so we don't return any JSX
      })}
    </>
  );
};