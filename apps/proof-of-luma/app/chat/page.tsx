// @ts-nocheck
"use client";
import React, { useEffect } from "react";
import MainScene from "../(screens)/MainScene";
import { useAccount, useReadContract } from "wagmi";
import { ProofOfLumaRegistryABI } from "../../abis/ProofOfLumaRegistry";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../util/firebase";

const PROOF_OF_LUMA_REGISTRY_ADDRESS = process.env
  .NEXT_PUBLIC_PROOF_OF_LUMA_REGISTRY_ADDRESS as `0x${string}`;


function Page() {
  const { address } = useAccount();
  const { data: isWhitelisted } = useReadContract({
    address: PROOF_OF_LUMA_REGISTRY_ADDRESS,
    abi: ProofOfLumaRegistryABI,
    functionName: "isUserJoined",
    args: [address],
    enabled: address,
  });


  useEffect(() => {
    if (!address) return;

    console.log(`isWhitelisted: ${isWhitelisted} address :$ ${address}`);
    if (isWhitelisted) {
      console.log(`isWhitelisted: ${isWhitelisted} address :$ ${address}`);
      const fetch = async () => {
        const userRef = doc(db, "users", address);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          // pass
        } else {
          const onChainStatus = false;
          await setDoc(userRef, { isWhitelisted: onChainStatus });
        }
      };
      fetch();

      
    }
  }, [isWhitelisted, address]);


  return (
    <div className="bg-black text-white">
      <MainScene />
    </div>
  );
}

export default Page;
