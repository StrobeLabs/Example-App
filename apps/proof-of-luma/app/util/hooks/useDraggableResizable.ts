/**
 * useDraggableResizable Hook
 *
 * This custom hook manages the dragging and resizing functionality for pictures on a canvas.
 * It provides state and handlers for dragging pictures, with the groundwork laid for future resizing functionality.
 *
 * Features:
 * - Manages state for dragging pictures
 * - Provides handlers for starting, continuing, and stopping picture dragging
 * - Calculates new positions for dragged pictures
 * - Updates picture positions in the database after dragging
 * - Integrates with canvas redrawing for real-time visual feedback
 *
 * @param pictures - Array of Picture objects that can be dragged
 * @param updatePicture - Function to update a picture's properties in the database
 * @param redrawCanvas - Function to redraw the canvas (for visual updates during dragging)
 *
 * @returns An object containing:
 *  - draggingPicture: The currently dragged picture (if any)
 *  - resizingPicture: Placeholder for future resizing functionality
 *  - startDraggingPicture: Handler to initiate picture dragging
 *  - dragPicture: Handler to update picture position during dragging
 *  - stopDraggingPicture: Handler to finalize picture position and update database
 */

import { useState, useCallback } from 'react';
import { DraggingPicture, Picture, ResizingPicture } from '../../components/subsections/chat/canvas-view/CanvasView';

export const useDraggableResizable = (
  pictures: Picture[],
  updatePicture: (id: string, updates: Partial<Picture>) => Promise<void>,
  redrawCanvas: () => void
) => {
  const [draggingPicture, setDraggingPicture] = useState<DraggingPicture | null>(null);
  const [resizingPicture, setResizingPicture] = useState<ResizingPicture | null>(null);

  const startDraggingPicture = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    for (const picture of pictures) {
      if (
        x >= picture.x &&
        x <= picture.x + picture.width &&
        y >= picture.y &&
        y <= picture.y + picture.height
      ) {
        setDraggingPicture({
          ...picture,
          offsetX: x - picture.x,
          offsetY: y - picture.y,
        });
        break;
      }
    }
  }, [pictures]);

  const dragPicture = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (draggingPicture) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      setDraggingPicture((prev) => {
        if (prev) {
          return {
            ...prev,
            x: x - prev.offsetX,
            y: y - prev.offsetY,
          };
        }
        return null;
      });

      redrawCanvas();
    }
  }, [draggingPicture, redrawCanvas]);

  const stopDraggingPicture = useCallback(async () => {
    if (draggingPicture) {
      await updatePicture(draggingPicture.id, {
        x: draggingPicture.x,
        y: draggingPicture.y,
      });
      setDraggingPicture(null);
    }
  }, [draggingPicture, updatePicture]);

  return {
    draggingPicture,
    resizingPicture,
    startDraggingPicture,
    dragPicture,
    stopDraggingPicture,
  };
};