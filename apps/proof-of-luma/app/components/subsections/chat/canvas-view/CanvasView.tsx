import React, { useRef, useEffect, useState, useCallback } from "react";
import { useAccount, useReadContract } from "wagmi";
import { ProofOfLumaRegistryABI } from "../../../../../abis/ProofOfLumaRegistry";
import { useImageCache } from "../../../../util/hooks/useImageCache";
import { useFirestorePictures } from "../../../../util/hooks/useFirestorePictures";
import { useGifHandling } from "../../../../util/hooks/useGifHandling";
import { CanvasManager } from "./CanvasManager";
import { ImageUploader } from "./ImageUploader";
import { ConfettiTrigger } from "../../../ConfettiTrigger";
import { PictureRenderer } from "./PictureRenderer";
import { useCanvasDrawer } from "../../../../util/hooks/useCanvasDrawer";
import { useDraggableResizable } from "../../../../util/hooks/useDraggableResizable";

/**
 * CanvasView Component
 * 
 * This component represents a canvas where users can upload, drag, resize, and view images.
 * It integrates with blockchain technology to check user whitelist status and manages
 * image rendering, including GIF animations.
 * 
 * Features:
 * - Image upload for whitelisted users
 * - Dragging and resizing of images on the canvas
 * - GIF animation support
 * - Responsive canvas that adjusts to window size
 * - Integration with Firestore for persistent storage of image data
 * 
 * The component uses several custom hooks for managing the canvas state, image caching,
 * and interaction with the blockchain and Firestore database.
 */

export interface Picture {
  id: string;
  url: string;
  x: number;
  y: number;
  width: number;
  height: number;
  timestamp?: Date;
}

export interface DraggingPicture extends Picture {
  offsetX: number;
  offsetY: number;
}

export interface ResizingPicture extends Picture {
  startWidth: number;
  startHeight: number;
  startX: number;
  startY: number;
}

const PROOF_OF_LUMA_REGISTRY_ADDRESS = process.env
  .NEXT_PUBLIC_PROOF_OF_LUMA_REGISTRY_ADDRESS as `0x${string}`;

function CanvasView() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { address } = useAccount();

  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);

  const { data: isWhitelisted } = useReadContract({
    address: PROOF_OF_LUMA_REGISTRY_ADDRESS,
    abi: ProofOfLumaRegistryABI,
    functionName: "isUserJoined",
    args: [address],
  });

  const { pictures, fetchPictures, updatePicture, addPicture } =
    useFirestorePictures();
  const { imageCache, preloadImages } = useImageCache();
  const { gifTimers, handleGifAnimation } = useGifHandling();

  const { redrawCanvas } = useCanvasDrawer(
    canvasRef,
    context,
    pictures,
    imageCache,
    handleGifAnimation
  );
  const {
    draggingPicture,
    resizingPicture,
    startDraggingPicture,
    dragPicture,
    stopDraggingPicture,
  } = useDraggableResizable(pictures, updatePicture, redrawCanvas);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setContext(ctx);

    const resizeCanvas = () => {
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = width;
      canvas.height = height;
      redrawCanvas();
    };

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    const unsubscribePictures = fetchPictures();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      unsubscribePictures();
      Object.values(gifTimers).forEach((timer) => clearInterval(timer));
    };
  }, [fetchPictures, gifTimers, redrawCanvas]);

  useEffect(() => {
    preloadImages(pictures);
  }, [pictures, preloadImages]);

  useEffect(() => {
    redrawCanvas();
  }, [pictures, context, redrawCanvas]);

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith("image/") && file.type !== "image/gif") {
      alert("Please upload an image or GIF file");
      return;
    }

    try {
      if (canvasRef.current) {
        const { width, height } = canvasRef.current;
        await addPicture(file, width, height);
        redrawCanvas();
      }
    } catch (error) {
      console.error("Error uploading picture: ", error);
      alert("Failed to upload image. Please try again.");
    }
  };

  return (
    <div className="relative w-full h-full hidden md:inline-block">
      <CanvasManager
        canvasRef={canvasRef}
        onStartDragging={startDraggingPicture}
        onStopDragging={stopDraggingPicture}
        onDrag={dragPicture}
      />
      <PictureRenderer
        pictures={pictures}
        draggingPicture={draggingPicture}
        resizingPicture={resizingPicture}
        imageCache={imageCache}
        handleGifAnimation={handleGifAnimation}
        context={context}
      />
      {isWhitelisted === true && (
        <>
          <ImageUploader onUpload={handleFileUpload} />
          <ConfettiTrigger />
        </>
      )}
    </div>
  );
}

export default CanvasView;