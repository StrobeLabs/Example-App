import React, { RefObject } from 'react';

/**
 * CanvasManager component
 * 
 * This component manages the canvas element and handles mouse events for dragging and moving pictures.
 * It provides a full-width and full-height canvas that responds to mouse interactions.
 * 
 * @param canvasRef - Reference to the canvas element
 * @param onStartDragging - Function to handle the start of a drag operation
 * @param onStopDragging - Function to handle the end of a drag operation
 * @param onDrag - Function to handle the dragging motion
 */

interface CanvasManagerProps {
  canvasRef: RefObject<HTMLCanvasElement>;
  onStartDragging: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onStopDragging: () => void;
  onDrag: (e: React.MouseEvent<HTMLCanvasElement>) => void;
}

export const CanvasManager: React.FC<CanvasManagerProps> = ({
  canvasRef,
  onStartDragging,
  onStopDragging,
  onDrag,
}) => {
  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full"
      onMouseDown={onStartDragging}
      onMouseUp={onStopDragging}
      onMouseOut={onStopDragging}
      onMouseMove={onDrag}
    />
  );
};