/**
 * StatusDisplay Component
 * 
 * This component displays the current status of the user's action in the proof generation
 * and community joining process. It provides visual feedback to the user about the
 * ongoing process or any errors that may have occurred.
 * 
 * The component takes a 'status' prop and renders a corresponding message with an
 * appropriate color. The status can be one of several predefined states, such as
 * 'idle', 'processing', 'proof_ready', 'joining', or various error states.
 * 
 * The component uses color coding to quickly convey the nature of the status:
 * - Red for errors
 * - Yellow for completed proof generation
 * - Green for successful joining process
 * - White for neutral or processing states
 * 
 * It also applies a pulsing animation to draw attention to the status message.
 */

import React from "react";

interface StatusDisplayProps {
  status: Status;
  estimatedTimeLeft?: number;
}

export type Status =
  | "idle"
  | "processing"  
  | "polling"
  | "proof_ready"
  | "joining"
  | "error"
  | "error_with_proof"
  | "error_processing"
  | "contract_error"
  | "transaction_rejected";

const StatusDisplay: React.FC<StatusDisplayProps> = ({ status, estimatedTimeLeft }) => {
  const statusColor = (status: string): string => {
    if (status.includes("error") || status === "transaction_rejected")
      return "red";
    if (status === "proof_ready") return "yellow";
    if (status === "joining") return "green";
    return "white";
  };

  
  const renderStatus = () => {
    switch (status) {
      case "idle":
        return "Ready to verify! Upload your email to get started.";
      case "processing":
        return "Analyzing your email...";
      case "polling":
        return `Creating your unique proof... Estimated time left: ${estimatedTimeLeft?.toFixed(2) ?? 'Calculating'} seconds`;
      case "proof_ready":
        return "Verification complete! You're ready to join the community.";
      case "joining":
        return "Finalizing your membership...";
      case "error":
        return "Oops! Something went wrong. Let's try that again.";
      case "error_with_proof":
        return "Oops! It looks like the Metamask transaction was rejected. Try joining again.";
      case "error_processing":
        return "We couldn't process that email. Double-check and try uploading again.";
      case "contract_error":
        return "The contract rejected the join request. You may have already joined or the proof might be invalid.";
      case "transaction_rejected":
        return "The transaction was rejected. Please try joining again.";
      default:
        return "";
    }
  };

  return (
    <div
      className="text-neutral-400 animate-pulse px-14 text-center text-sm"
      style={{
        color: statusColor(status),
      }}
    >
      {renderStatus()}
    </div>
  );
};

export default StatusDisplay;