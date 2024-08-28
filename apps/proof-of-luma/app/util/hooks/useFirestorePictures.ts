/**
 * useFirestorePictures Hook
 * 
 * This custom hook manages the interaction with Firestore for picture-related operations.
 * It provides functionality to fetch, update, and add pictures to the Firestore database.
 * 
 * Features:
 * - Fetches and listens to real-time updates of pictures from Firestore
 * - Allows updating existing pictures in the database
 * - Provides a method to add new pictures with random positioning on the canvas
 * 
 * @returns An object containing:
 *   - pictures: An array of Picture objects fetched from Firestore
 *   - fetchPictures: A function to initiate fetching and listening to picture updates
 *   - updatePicture: A function to update a specific picture in Firestore
 *   - addPicture: A function to add a new picture to Firestore with calculated position
 */

import { useState, useCallback } from 'react';
import { collection, addDoc, onSnapshot, query, updateDoc, doc } from "firebase/firestore";
import { db } from '../constants/firebase';
import { Picture } from '../../components/subsections/chat/canvas-view/CanvasView';

export const useFirestorePictures = () => {
  const [pictures, setPictures] = useState<Picture[]>([]);

  const fetchPictures = useCallback(() => {
    const picturesQuery = query(collection(db, "pictures"));
    return onSnapshot(picturesQuery, (querySnapshot) => {
      const fetchedPictures: Picture[] = [];
      querySnapshot.forEach((doc) => {
        fetchedPictures.push({ id: doc.id, ...doc.data() } as Picture);
      });
      setPictures(fetchedPictures);
    });
  }, []);

  const updatePicture = useCallback(async (id: string, data: Partial<Picture>) => {
    await updateDoc(doc(db, "pictures", id), data);
  }, []);

  const addPicture = useCallback(async (file: File, canvasWidth: number, canvasHeight: number) => {
    // Generate a unique URL for the file
    const url = URL.createObjectURL(file);
    
    // Calculate random position within the canvas
    const x = Math.random() * (canvasWidth - 100);
    const y = Math.random() * (canvasHeight - 100);
    
    // Set initial width and height (you can adjust these values)
    const width = 100;
    const height = 100;
  
    const newPicture: Omit<Picture, 'id'> = {
      url,
      x,
      y,
      width,
      height,
      timestamp: new Date()
    };
  
    const docRef = await addDoc(collection(db, "pictures"), newPicture);
    return { id: docRef.id, ...newPicture };
  }, []);

  return { pictures, fetchPictures, updatePicture, addPicture };
};