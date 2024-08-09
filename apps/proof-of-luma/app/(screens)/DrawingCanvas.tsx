// @ts-nocheck
import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  updateDoc,
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db } from "../util/firebase";
import { useAccount, useReadContract } from "wagmi";
import { ProofOfLumaRegistryABI } from "../../abis/ProofOfLumaRegistry";

const PROOF_OF_LUMA_REGISTRY_ADDRESS = process.env
  .NEXT_PUBLIC_PROOF_OF_LUMA_REGISTRY_ADDRESS as `0x${string}`;

function DrawingCanvas() {
  const canvasRef = useRef(null);
  const { address } = useAccount();

  const [context, setContext] = useState(null);
  const [pictures, setPictures] = useState([]);
  const [draggingPicture, setDraggingPicture] = useState(null);
  const [resizingPicture, setResizingPicture] = useState(null);
  const [gifTimers, setGifTimers] = useState({});
  const { data: isWhitelisted, refetch: refetchWhitelist } = useReadContract({
    address: PROOF_OF_LUMA_REGISTRY_ADDRESS,
    abi: ProofOfLumaRegistryABI,
    functionName: "isUserJoined",
    args: [address],
  });

  const imageCache = useRef({});

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    setContext(ctx);

    const resizeCanvas = () => {
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = width;
      canvas.height = height;
      redrawCanvas();
    };

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    const picturesQuery = query(collection(db, "pictures"));

    const unsubscribePictures = onSnapshot(picturesQuery, (querySnapshot) => {
      const fetchedPictures = [];
      querySnapshot.forEach((doc) => {
        fetchedPictures.push({ id: doc.id, ...doc.data() });
      });
      setPictures(fetchedPictures);
    });

    const handlePaste = async (e) => {
      const clipboardItems = e.clipboardData.items;
      for (let i = 0; i < clipboardItems.length; i++) {
        const item = clipboardItems[i];
        if (item.type.includes("image")) {
          const file = item.getAsFile();
          const storage = getStorage();
          const storageRef = ref(storage, `pictures/${file.name}`);

          try {
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);

            const img = new Image();
            img.src = downloadURL;
            await new Promise((resolve) => {
              img.onload = resolve;
            });

            const canvas = canvasRef.current;
            const { x, y } = getRandomPosition(canvas);

            const newPicture = {
              url: downloadURL,
              x,
              y,
              width: img.width,
              height: img.height,
              timestamp: new Date(), // Add a timestamp for sorting
            };

            await addDoc(collection(db, "pictures"), newPicture);
          } catch (error) {
            console.error("Error uploading picture: ", error);
            alert("Failed to upload image. Please try again.");
          }
        }
      }
    };

    window.addEventListener("paste", handlePaste);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("paste", handlePaste);
      unsubscribePictures();
      Object.values(gifTimers).forEach((timer) => clearInterval(timer));
    };
  }, [gifTimers]);

  const preloadImages = useMemo(() => {
    pictures.forEach((picture) => {
      if (!imageCache.current[picture.url]) {
        const img = new Image();
        img.src = picture.url;
        img.onload = () => {
          imageCache.current[picture.url] = img;
          redrawCanvas();
        };
      }
    });
  }, [pictures]);

  const redrawCanvas = useCallback(() => {
    if (!context || !canvasRef.current) return;
    const canvas = canvasRef.current;
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Sort pictures by timestamp, most recent first
    const sortedPictures = [...pictures].sort((a, b) => {
      if (!a.timestamp && !b.timestamp) return 0;
      if (!a.timestamp) return -1;
      if (!b.timestamp) return 1;
      return new Date(b.timestamp) - new Date(a.timestamp);
    });

    // Draw pictures on the canvas
    sortedPictures.forEach((picture) => {
      const img = imageCache.current[picture.url];
      if (img) {
        let x, y, width, height;
        if (draggingPicture && draggingPicture.id === picture.id) {
          ({ x, y, width, height } = draggingPicture);
        } else if (resizingPicture && resizingPicture.id === picture.id) {
          ({ x, y, width, height } = resizingPicture);
        } else {
          ({ x, y, width, height } = picture);
        }

        if (picture.url.endsWith(".gif")) {
          // Handle GIF animation manually
          const canvasGif = document.createElement("canvas");
          canvasGif.width = img.width;
          canvasGif.height = img.height;
          const ctxGif = canvasGif.getContext("2d");
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
        } else {
          context.drawImage(img, x, y, width, height);

          // Draw resize handle
          context.fillStyle = "magenta";
          context.fillRect(x + width - 5, y + height - 5, 10, 10);
          context.strokeStyle = "magenta";
          context.strokeRect(x + width - 5, y + height - 5, 10, 10);
        }
      }
    });
  }, [context, pictures, draggingPicture, resizingPicture]);

  useEffect(() => {
    redrawCanvas();
  }, [pictures, context, redrawCanvas]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/") && file.type !== "image/gif") {
      alert("Please upload an image or GIF file");
      return;
    }

    const storage = getStorage();
    const storageRef = ref(storage, `pictures/${file.name}`);

    try {
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      const canvas = canvasRef.current;
      const { x, y } = getRandomPosition(canvas);

      // Get the actual image size
      const img = new Image();
      img.src = downloadURL;
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const newPicture = {
        url: downloadURL,
        x,
        y,
        width: img.width,
        height: img.height,
        timestamp: new Date(), // Add a timestamp for sorting
      };

      await addDoc(collection(db, "pictures"), newPicture);
    } catch (error) {
      console.error("Error uploading picture: ", error);
      alert("Failed to upload image. Please try again.");
    }
  };

  const startDraggingPicture = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const clickedPicture = pictures.find(
      (pic) =>
        x >= pic.x &&
        x <= pic.x + pic.width &&
        y >= pic.y &&
        y <= pic.y + pic.height
    );

    if (clickedPicture) {
      // Check if clicking on the bottom-right corner (for resizing)
      const cornerSize = 10;
      if (
        x >= clickedPicture.x + clickedPicture.width - cornerSize &&
        y >= clickedPicture.y + clickedPicture.height - cornerSize
      ) {
        setResizingPicture({
          ...clickedPicture,
          startWidth: clickedPicture.width,
          startHeight: clickedPicture.height,
          startX: x,
          startY: y,
        });
      } else {
        setDraggingPicture({
          ...clickedPicture,
          offsetX: x - clickedPicture.x,
          offsetY: y - clickedPicture.y,
        });
      }
      e.preventDefault();
    }
  };

  const dragPicture = (e) => {
    if (draggingPicture) {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();

      const newX = e.clientX - rect.left - draggingPicture.offsetX;
      const newY = e.clientY - rect.top - draggingPicture.offsetY;

      setDraggingPicture((prev) => ({
        ...prev,
        x: newX,
        y: newY,
      }));

      redrawCanvas();
    } else if (resizingPicture) {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();

      const newWidth =
        resizingPicture.startWidth +
        (e.clientX - rect.left - resizingPicture.startX);
      const newHeight =
        resizingPicture.startHeight +
        (e.clientY - rect.top - resizingPicture.startY);

      setResizingPicture((prev) => ({
        width: Math.max(20, newWidth), // Minimum size of 20x20
        height: Math.max(20, newHeight),
      }));

      redrawCanvas();
    }
  };

  const stopDraggingPicture = async () => {
    if (draggingPicture) {
      const { id, x, y, width, height } = draggingPicture;
      await updateDoc(doc(db, "pictures", id), { x, y, width, height });
      setDraggingPicture(null);
    } else if (resizingPicture) {
      const { id, x, y, width, height } = resizingPicture;
      await updateDoc(doc(db, "pictures", id), { x, y, width, height });
      setResizingPicture(null);
    }
  };

  const getRandomPosition = (canvas) => {
    return {
      x: Math.random() * (canvas.width - 100), // Subtracting 100 to keep within canvas
      y: Math.random() * (canvas.height - 100),
    };
  };

  const triggerConfetti = async () => {
    const confettiRef = doc(db, "confetti", "global");

    try {
      await updateDoc(confettiRef, { timestamp: serverTimestamp() });
    } catch (error) {
      if (error.code === "not-found") {
        await setDoc(confettiRef, { timestamp: serverTimestamp() });
      } else {
        console.error("Error updating confetti document: ", error);
      }
    }
  };

  return (
    <div className="relative w-full h-full hidden md:inline-block">
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full"
        onMouseDown={(e) => {
          startDraggingPicture(e);
        }}
        onMouseUp={() => {
          stopDraggingPicture();
        }}
        onMouseOut={() => {
          stopDraggingPicture();
        }}
        onMouseMove={(e) => {
          dragPicture(e);
        }}
      />

      {!isWhitelisted || isWhitelisted == false ? (
        <></>
      ) : (
        <>
          <label className="absolute top-4 left-4 z-20 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded cursor-pointer transition duration-300 ease-in-out">
            Upload Image
            <input
              type="file"
              accept="image/*,image/gif"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </>
      )}

      {!isWhitelisted || isWhitelisted == false ? (
        <></>
      ) : (
        <>
          <label
            onClick={triggerConfetti}
            className="absolute 
          
          top-4 left-44 z-20 bg-gray-700 hover:bg-gray-800 text-white font-bold py-2 px-4 rounded cursor-pointer transition duration-300 ease-in-out"
          >
            <button onClick={triggerConfetti}>😩</button>
          </label>
        </>
      )}
    </div>
  );
}

export default DrawingCanvas;
