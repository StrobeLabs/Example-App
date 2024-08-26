/**
 * Main Component
 *
 * This component serves as the main entry point for the home page of the proof-of-luma application.
 * It manages the overall flow and state of the proof generation and community joining process.
 *
 * The component uses several custom hooks:
 * - useAccount: To get the user's connection status and address
 * - useRouter: For navigation
 * - useProofGeneration: To manage the proof generation process
 * - useJoinCommunity: To handle the community joining process
 *
 * Based on the user's status (whitelisted or not) and the current state of the proof generation process,
 * this component renders one of three views:
 * 1. JoiningView: When the user is in the process of joining the community
 * 2. NotWhitelistedView: When the user is not whitelisted and needs to generate a proof
 * 3. WhitelistedView: When the user is already whitelisted and can access the chat
 *
 * The component also manages side effects, such as updating the user's whitelist status in Firebase
 * and redirecting to the chat page after successful whitelisting.
 */

import React, { useEffect } from "react";

import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../../util/constants/firebase";

import { useProofGeneration } from "../../../util/hooks/useProofGeneration";
import { useJoinCommunity } from "../../../util/hooks/useJoinCommunity";
import NotWhitelistedView from "./not-whitelisted-view/NotWhitelistedView";
import JoiningView from "./joining-view/JoiningView";
import { WhitelistedView } from "./whitelisted-view/WhitelistedView";

export default function Main() {
  const { isConnected, address } = useAccount();
  const router = useRouter();
  const {
    status,
    proofMethod,
    file,
    proofFile,
    publicOutputFile,
    encodedProof,
    encodedPublicSignals,
    selectedProofFileName,
    selectedPublicOutputFileName,
    estimatedTimeLeft,
    handleRemoteProof,
    handleLocalProof,
    handleProofMethodChange,
  } = useProofGeneration();

  const { isWhitelisted, isJoining, handleJoin } = useJoinCommunity(
    address as string,
    status,
    (newStatus) => {
      // Reload the page if the user is whitelisted (optimistically)
      if (newStatus === "whitelisted") {
        if (window) {
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        }
      }
    },
    router
  );

  const createNewUser = async () => {
    const userRef = doc(db, "users", address as string);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      await setDoc(userRef, { isWhitelisted: false });
    }

    router.push("/chat");
  };

  useEffect(() => {
    if (isWhitelisted && address) {
      createNewUser();
    }
  }, [isWhitelisted, address, router]);

  if (status === "joining") {
    return <JoiningView router={router} />;
  }

  if (!isWhitelisted) {
    return (
      <NotWhitelistedView
        estimatedTimeLeft={estimatedTimeLeft}
        isConnected={isConnected}
        isWhitelisted={isWhitelisted as boolean}
        status={status}
        proofMethod={proofMethod}
        handleProofMethodChange={handleProofMethodChange}
        handleRemoteProof={handleRemoteProof}
        handleLocalProof={handleLocalProof}
        selectedProofFileName={selectedProofFileName}
        selectedPublicOutputFileName={selectedPublicOutputFileName}
        file={file}
        proofFile={proofFile}
        publicOutputFile={publicOutputFile}
        handleJoin={() => handleJoin(encodedProof!, encodedPublicSignals!)}
        isJoining={isJoining}
      />
    );
  }

  return <WhitelistedView router={router} />;
}
