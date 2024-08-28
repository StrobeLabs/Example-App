/**
 * Chat Page Component
 * 
 * This component serves as the main chat page for the Proof of Luma application.
 * It handles user authentication, whitelist status checking, and renders the main chat interface.
 * 
 * Key features:
 * - Checks if the user is whitelisted using the ProofOfLumaRegistry smart contract
 * - Creates a user document in Firestore if it doesn't exist (if and only if the user is whitelisted thru the smart contract)
 * - Implements a global confetti effect that can be triggered across all clients
 * - Renders the MainScene component which contains the chat and drawing interfaces
 * 
 * The component uses several hooks:
 * - useAccount: To get the user's Ethereum address
 * - useReadContract: To check the user's whitelist status on-chain
 * - useState and useEffect: To manage component state and side effects
 * 
 * External dependencies:
 * - wagmi: For Ethereum interactions
 * - firebase/firestore: For database operations
 * - react-confetti: For the confetti animation effect
 */

"use client";

import React, { useEffect, useState } from "react";
import { useAccount, useReadContract } from "wagmi";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import Confetti from 'react-confetti';
import { ProofOfLumaRegistryABI } from "../../../abis/ProofOfLumaRegistry";
import { db } from "../../util/constants/firebase";
import Main from "../../components/subsections/chat/Main";

const PROOF_OF_LUMA_REGISTRY_ADDRESS = process.env.NEXT_PUBLIC_PROOF_OF_LUMA_REGISTRY_ADDRESS as `0x${string}`;

function Page() {
  const { address } = useAccount();
  const { data: isWhitelisted } = useReadContract({
    address: PROOF_OF_LUMA_REGISTRY_ADDRESS,
    abi: ProofOfLumaRegistryABI,
    functionName: "isUserJoined",
    args: [address],
  });

  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (!address || !isWhitelisted) return;

    const createUserIfNotExists = async () => {
      const userRef = doc(db, "users", address);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        await setDoc(userRef, { isWhitelisted: false });
      }
    };

    createUserIfNotExists();
  }, [isWhitelisted, address]);

  
  // This useEffect hook sets up a listener for the global confetti trigger in Firestore.
  // The animation is synchronized across all clients within a 3-second window of the trigger event.
  // The confetti display lasts for some seconds before automatically disappearing.
  // The confetti is triggerred via the confetti button on <MainScene />
  useEffect(() => {
    const confettiRef = doc(db, "confetti", "global");

    const unsubscribe = onSnapshot(confettiRef, (doc) => {
      const data = doc.data();
      if (!data) return;

      if (data.timestamp) {
        const now = new Date();
        const timestamp = data.timestamp.toDate();
        if (Math.abs(now.getTime() - timestamp.getTime()) < 3000) { // 3 second window
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 3000);
        }
      }

    });

    return () => unsubscribe();
  }, []);

  const confettiProps = {
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
    numberOfPieces: 200,
    gravity: 0.8
  }

  return (
    <div className="bg-black text-white">
      <Main />
      {showConfetti && <Confetti {...confettiProps} />}
    </div>
  );
}

export default Page;
