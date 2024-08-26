import React from 'react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../util/constants/firebase';

/**
 * ConfettiTrigger Component
 * 
 * This component renders a button that, when clicked, triggers a confetti effect
 * by updating a document in Firestore. The confetti effect is likely handled elsewhere
 * in the application, listening for changes to this document.
 * 
 * The button is positioned absolutely and styled with Tailwind CSS classes.
 */
export const ConfettiTrigger: React.FC = () => {
  /**
   * Triggers the confetti effect by updating a Firestore document
   * with the current server timestamp.
   */
  const triggerConfetti = async () => {
    const confettiRef = doc(db, "confetti", "global");

    try {
      await updateDoc(confettiRef, { timestamp: serverTimestamp() });
    } catch (error) {
      console.error("Error triggering confetti:", error);
    }
  };

  return (
    <button
      onClick={triggerConfetti}
      className="absolute top-4 left-44 z-20 bg-gray-700 hover:bg-gray-800 text-white font-bold py-2 px-4 rounded cursor-pointer transition duration-300 ease-in-out"
      aria-label="Trigger Confetti"
    >
      😩
    </button>
  );
};