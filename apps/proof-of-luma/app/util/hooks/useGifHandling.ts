/**
 * useGifHandling Hook
 * 
 * This custom hook manages the handling and animation of GIF images on a canvas.
 * It provides functionality to animate GIFs frame by frame and manage their timers.
 * 
 * Features:
 * - Manages state for GIF animation timers
 * - Provides a function to handle GIF animations on a canvas
 * - Supports multiple GIFs with individual timers
 * - Draws resize handles for each GIF
 * - Optimizes performance by using a separate canvas for GIF rendering
 * 
 * @returns An object containing:
 *   - gifTimers: A record of active GIF animation timers
 *   - setGifTimers: A function to update the GIF timers state
 *   - handleGifAnimation: A function to initiate and manage GIF animations on the canvas
 */

import { useState, useCallback } from "react";

interface GifTimers {
  [key: string]: number | any;
}

export const useGifHandling = () => {
  const [gifTimers, setGifTimers] = useState<GifTimers>({});

  const handleGifAnimation = useCallback(
    (
      context: CanvasRenderingContext2D,
      picture: {
        id: string;
        url: string;
        x: number;
        y: number;
        width: number;
        height: number;
      },
      img: HTMLImageElement,
      x: number,
      y: number,
      width: number,
      height: number
    ) => {
      const canvasGif = document.createElement("canvas");
      canvasGif.width = img.width;
      canvasGif.height = img.height;
      const ctxGif = canvasGif.getContext("2d");
      if (!ctxGif) return;

      let frameIndex = 0;
      const playGif = () => {
        ctxGif.clearRect(0, 0, canvasGif.width, canvasGif.height);
        ctxGif.drawImage(
          img,
          0,
          -frameIndex * canvasGif.height,
          canvasGif.width,
          canvasGif.height
        );
        context.clearRect(x, y, width, height);
        context.drawImage(canvasGif, x, y, width, height);

        // Draw resize handle
        context.fillStyle = "magenta";
        context.fillRect(x + width - 5, y + height - 5, 10, 10);
        context.strokeStyle = "magenta";
        context.strokeRect(x + width - 5, y + height - 5, 10, 10);

        frameIndex = (frameIndex + 1) % (img.height / canvasGif.height);
      };

      const interval = setInterval(playGif, 100); // Change 100 to the desired frame duration
      setGifTimers((prevTimers) => ({
        ...prevTimers,
        [picture.id]: interval,
      }));
    },
    []
  );

  return { gifTimers, setGifTimers, handleGifAnimation };
};
