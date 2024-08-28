/**
 * JoinCommunityButton Component
 * 
 * This component renders a button that allows users to join a community in the proof-of-luma application.
 * The button's visibility and functionality are controlled by various props that represent the current state
 * of the proof generation and joining process.
 * 
 * The button is only displayed when:
 * 1. A valid proof method is selected (remote or local) and the necessary files are provided.
 * 2. The status indicates that a proof is ready or there was an error that still allows joining.
 * 
 * When displayed, the button can be clicked to trigger the joining process, unless it's already in progress.
 * The button's text changes to "Joining..." when the joining process is ongoing.
 * 
 * Props:
 * - proofMethod: The selected method for proof generation ('remote', 'local', or null)
 * - file: The selected file for remote proof generation
 * - proofFile: The selected proof file for local proof upload
 * - publicOutputFile: The selected public output file for local proof upload
 * - status: The current status of the proof generation and joining process
 * - handleJoin: Function to handle the join action
 * - isJoining: Boolean indicating whether the joining process is currently in progress
 */

import React from "react";

interface JoinCommunityButtonProps {
  proofMethod: "remote" | "local" | null;
  file: File | null;
  proofFile: File | null;
  publicOutputFile: File | null;
  status: string;
  handleJoin: () => void;
  isJoining: boolean;
}

const JoinCommunityButton: React.FC<JoinCommunityButtonProps> = ({
  proofMethod,
  file,
  proofFile,
  publicOutputFile,
  status,
  handleJoin,
  isJoining,
}) => {
  const isProofReady = status === "proof_ready";
  const isErrorAllowingJoin = ["error_with_proof", "contract_error", "transaction_rejected"].includes(status);
  const isValidRemoteProof = proofMethod === "remote" && file !== null;
  const isValidLocalProof = proofMethod === "local" && proofFile !== null && publicOutputFile !== null;
  
  if ((isValidRemoteProof || isValidLocalProof) && (isProofReady || isErrorAllowingJoin)) {
    return (
      <button
        type="button"
        className="flex justify-center items-center p-4 mt-4 bg-neutral-400 text-neutral-800 rounded-full font-bold transition duration-300 hover:bg-neutral-700 hover:text-neutral-500"
        onClick={handleJoin}
        disabled={!isProofReady && !isErrorAllowingJoin || isJoining}
      >
        {isJoining ? "Joining..." : "Join Community"}
      </button>
    );
  }
  return null;
};

export default JoinCommunityButton;