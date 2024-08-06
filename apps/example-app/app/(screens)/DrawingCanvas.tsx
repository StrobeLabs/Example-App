// @ts-nocheck
"use client";
import React, { useRef, useEffect, useState } from 'react';
import { collection, addDoc, onSnapshot, query } from 'firebase/firestore';
import { db } from '../util/firebase';

function DrawingCanvas() {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [context, setContext] = useState(null);
  const [drawings, setDrawings] = useState([]);
  const [currentPath, setCurrentPath] = useState([]);
  const [currentColor, setCurrentColor] = useState('');

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.lineWidth = 2;
    setContext(ctx);

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      console.log(`Canvas resized to ${canvas.width}x${canvas.height}`);
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const q = query(collection(db, 'drawings'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedDrawings = [];
      querySnapshot.forEach((doc) => {
        fetchedDrawings.push(doc.data());
      });
      setDrawings(fetchedDrawings);
    });

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    redrawCanvas();
  }, [drawings, context]);

  const getRandomColor = () => {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return `rgb(${r},${g},${b})`;
  };

  const redrawCanvas = () => {
    if (!context || !canvasRef.current) {
      console.log('Context or canvas not available');
      return;
    }
    console.log('Redrawing canvas');
    context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    drawings.forEach((drawing, index) => {
      drawPath(drawing.path, drawing.color);
    });
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
    const x = ((e.clientX - rect.left) / canvas.width) * 100;
    const y = ((e.clientY - rect.top) / canvas.height) * 100;

    setCurrentPath((prev) => [...prev, { x, y }]);

    const scaledPoint = scalePoint({ x, y });
    context.lineTo(scaledPoint.x, scaledPoint.y);
    context.stroke();
    context.beginPath();
    context.moveTo(scaledPoint.x, scaledPoint.y);
  };

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-[65vw] h-full z-10"
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.0)',
        // border: '1px solid red' // Added for visibility
      }}
      onMouseDown={startDrawing}
      onMouseUp={stopDrawing}
      onMouseOut={stopDrawing}
      onMouseMove={draw}
    />
  );
}

export default DrawingCanvas;