// @ts-nocheck
"use client";
import React, { useRef, useEffect, useState } from 'react';
import { collection, addDoc, onSnapshot, query, updateDoc, doc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db } from '../util/firebase';

function DrawingCanvas() {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [context, setContext] = useState(null);
    const [drawings, setDrawings] = useState([]);
    const [pictures, setPictures] = useState([]);
    const [currentPath, setCurrentPath] = useState([]);
    const [currentColor, setCurrentColor] = useState('');
    const [draggingPicture, setDraggingPicture] = useState(null);
    const [resizingPicture, setResizingPicture] = useState(null);
  
    useEffect(() => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.lineWidth = 2;
      setContext(ctx);
  
      const resizeCanvas = () => {
        const { width, height } = canvas.getBoundingClientRect();
        canvas.width = width;
        canvas.height = height;
      };
  
      window.addEventListener('resize', resizeCanvas);
      resizeCanvas();
  
      const drawingsQuery = query(collection(db, 'drawings'));
      const picturesQuery = query(collection(db, 'pictures'));
  
      const unsubscribeDrawings = onSnapshot(drawingsQuery, (querySnapshot) => {
        const fetchedDrawings = [];
        querySnapshot.forEach((doc) => {
          fetchedDrawings.push({ id: doc.id, ...doc.data() });
        });
        setDrawings(fetchedDrawings);
      });
  
      const unsubscribePictures = onSnapshot(picturesQuery, (querySnapshot) => {
        const fetchedPictures = [];
        querySnapshot.forEach((doc) => {
          fetchedPictures.push({ id: doc.id, ...doc.data() });
        });
        setPictures(fetchedPictures);
      });
  
      return () => {
        window.removeEventListener('resize', resizeCanvas);
        unsubscribeDrawings();
        unsubscribePictures();
      };
    }, []);
  
    useEffect(() => {
      redrawCanvas();
    }, [drawings, pictures, context]);


    const getRandomColor = () => {
      const r = Math.floor(Math.random() * 256);
      const g = Math.floor(Math.random() * 256);
      const b = Math.floor(Math.random() * 256);
      return `rgb(${r},${g},${b})`;
    };

    const drawPath = (path, color) => {
      if (!context || !path || path.length === 0) {
        console.log('Invalid path or context');
        return;
      }
      context.beginPath();
      context.strokeStyle = color;
      const start = scalePoint(path[0]);
      context.moveTo(start.x, start.y);
      path.forEach((point) => {
        const { x, y } = scalePoint(point);
        context.lineTo(x, y);
      });
      context.stroke();
    };

    const scalePoint = (point) => {
      const canvas = canvasRef.current;
      return {
        x: (point.x / 100) * canvas.width,
        y: (point.y / 100) * canvas.height,
      };
    };

    const startDrawing = (e) => {
      if (draggingPicture) return;
      setIsDrawing(true);
      setCurrentPath([]);
      const newColor = getRandomColor();
      setCurrentColor(newColor);
      context.strokeStyle = newColor;
      draw(e);
    };

    const stopDrawing = () => {
      setIsDrawing(false);
      context.beginPath();
      if (currentPath.length > 0) {
        addDoc(collection(db, 'drawings'), {
          path: currentPath,
          color: currentColor,
          timestamp: new Date(),
        });
      }
    };

    const draw = (e) => {
      if (!isDrawing || !context) return;
    
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
    
      const x = ((e.clientX - rect.left) * scaleX / canvas.width) * 100;
      const y = ((e.clientY - rect.top) * scaleY / canvas.height) * 100;
    
      setCurrentPath((prev) => [...prev, { x, y }]);
    
      const scaledPoint = scalePoint({ x, y });
      context.lineTo(scaledPoint.x, scaledPoint.y);
      context.stroke();
      context.beginPath();
      context.moveTo(scaledPoint.x, scaledPoint.y);
    };

    const handleFileUpload = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
    
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
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
        };
    
        await addDoc(collection(db, 'pictures'), newPicture);
      } catch (error) {
        console.error("Error uploading picture: ", error);
        alert('Failed to upload image. Please try again.');
      }
    };

    const startDraggingPicture = (e) => {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
    
      const clickedPicture = pictures.find(pic => 
        x >= pic.x && x <= pic.x + pic.width &&
        y >= pic.y && y <= pic.y + pic.height
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
    
        setDraggingPicture(prev => ({
          ...prev,
          x: newX,
          y: newY,
        }));
    
        redrawCanvas();
      } else if (resizingPicture) {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
    
        const newWidth = resizingPicture.startWidth + (e.clientX - rect.left - resizingPicture.startX);
        const newHeight = resizingPicture.startHeight + (e.clientY - rect.top - resizingPicture.startY);
    
        setResizingPicture(prev => ({
          ...prev,
          width: Math.max(20, newWidth),  // Minimum size of 20x20
          height: Math.max(20, newHeight),
        }));
    
        redrawCanvas();
      }
    };

    const stopDraggingPicture = async () => {
      if (draggingPicture) {
        const { id, x, y, width, height } = draggingPicture;
        await updateDoc(doc(db, 'pictures', id), { x, y, width, height });
        setDraggingPicture(null);
      } else if (resizingPicture) {
        const { id, x, y, width, height } = resizingPicture;
        await updateDoc(doc(db, 'pictures', id), { x, y, width, height });
        setResizingPicture(null);
      }
    };

    const redrawCanvas = () => {
      if (!context || !canvasRef.current) return;
      const canvas = canvasRef.current;
      context.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw pictures
      pictures.forEach((picture) => {
        const img = new Image();
        img.onload = () => {
          let x, y, width, height;
          if (draggingPicture && draggingPicture.id === picture.id) {
            ({ x, y, width, height } = draggingPicture);
          } else if (resizingPicture && resizingPicture.id === picture.id) {
            ({ x, y, width, height } = resizingPicture);
          } else {
            ({ x, y, width, height } = picture);
          }
          context.drawImage(img, x, y, width, height);
          
          // Draw resize handle
          context.fillStyle = 'magenta';
          context.fillRect(x + width - 5, y + height - 5, 10, 10);
          context.strokeStyle = 'magenta';
          context.strokeRect(x + width - 5, y + height - 5, 10, 10);
        };
        img.src = picture.url;
        img.style.cursor = 'pointer';
      });
    
      // Draw paths
      drawings.forEach((drawing) => {
        drawPath(drawing.path, drawing.color);
      });
    };

      useEffect(() => {
        if (context) {
          redrawCanvas();
        }
      }, [pictures, drawings, context]);

      const getRandomPosition = (canvas) => {
        return {
          x: Math.random() * (canvas.width - 100),  // Subtracting 100 to keep within canvas
          y: Math.random() * (canvas.height - 100)
        };
      };


      return (
        <div className="relative w-full h-full">
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full"
          onMouseDown={(e) => {
            startDrawing(e);
            startDraggingPicture(e);
          }}
          onMouseUp={() => {
            stopDrawing();
            stopDraggingPicture();
          }}
          onMouseOut={() => {
            stopDrawing();
            stopDraggingPicture();
          }}
          onMouseMove={(e) => {
            draw(e);
            dragPicture(e);
          }}
        />
      
        <label className="absolute top-4 left-4 z-20 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded cursor-pointer transition duration-300 ease-in-out">
    Upload Image
    <input
      type="file"
      accept="image/*"
      onChange={handleFileUpload}
      className="hidden"
    />
  </label>
      </div>
      );
}

export default DrawingCanvas;