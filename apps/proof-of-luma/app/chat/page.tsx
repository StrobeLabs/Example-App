// @ts-nocheck
"use client";

import React, { useEffect, useState } from "react";
import MainScene from "../(screens)/MainScene";
import { useAccount, useReadContract } from "wagmi";
import { ProofOfLumaRegistryABI } from "../../abis/ProofOfLumaRegistry";
import { doc, getDoc, setDoc, onSnapshot, serverTimestamp, updateDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db } from "../util/firebase";
import Confetti from 'react-confetti';

const PROOF_OF_LUMA_REGISTRY_ADDRESS = process.env.NEXT_PUBLIC_PROOF_OF_LUMA_REGISTRY_ADDRESS as `0x${string}`;

function Page() {
  const { address } = useAccount();
  const { data: isWhitelisted } = useReadContract({
    address: PROOF_OF_LUMA_REGISTRY_ADDRESS,
    abi: ProofOfLumaRegistryABI,
    functionName: "isUserJoined",
    args: [address],
    enabled: address,
  });

  const [showConfetti, setShowConfetti] = useState(false);
  const [customImage, setCustomImage] = useState('');
  const storage = getStorage();

  useEffect(() => {
    if (!address) return;

    console.log(`isWhitelisted: ${isWhitelisted} address: ${address}`);
    if (isWhitelisted) {
      const fetch = async () => {
        const userRef = doc(db, "users", address);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
          await setDoc(userRef, { isWhitelisted: false });
        }
      };
      fetch();
    }
  }, [isWhitelisted, address]);

  useEffect(() => {
    const confettiRef = doc(db, "confetti", "global");

    const unsubscribe = onSnapshot(confettiRef, (doc) => {
      const data = doc.data();
      if (data && data.timestamp) {
        const now = new Date();
        const timestamp = data.timestamp.toDate();
        if (Math.abs(now.getTime() - timestamp.getTime()) < 3000) { // 3 second window
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 3000);
        }
      }
      if (data && data.customImage) {
        setCustomImage(data.customImage);
      }
    });

    return () => unsubscribe();
  }, []);

  

  const confettiProps = {
    width: window.innerWidth,
    height: window.innerHeight,
    numberOfPieces: 200,
    gravity: 0.8
  }

  return (
    <div className="bg-black text-white">
      <MainScene />
      {showConfetti && <Confetti {...confettiProps} />}
      
      
     
     
    </div>
  );
}

export default Page;
