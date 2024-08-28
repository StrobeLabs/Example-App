/**
 * ProofMethodSelector Component
 * 
 * This component provides a user interface for selecting the method of proof generation
 * in the proof-of-luma application. It offers two options: generating a proof remotely
 * or uploading a local proof.
 * 
 * The component renders two buttons, one for each proof method. The currently selected
 * method is visually highlighted. When a button is clicked, it triggers the onMethodChange
 * function passed as a prop, updating the selected proof method in the parent component.
 * 
 * Props:
 * - proofMethod: The currently selected proof method ('remote', 'local', or null)
 * - onMethodChange: Function to handle changes in the selected proof method
 */

import React from "react";

type ProofMethod = "remote" | "local" | null;

interface ProofMethodSelectorProps {
  proofMethod: ProofMethod;
  onMethodChange: (method: ProofMethod) => void;
}

const ProofMethodSelector: React.FC<ProofMethodSelectorProps> = ({
  proofMethod,
  onMethodChange,
}) => (
  <div className="flex gap-4">
    <button
      onClick={() => onMethodChange("remote")}
      className={`p-4 rounded-full ${
        proofMethod === "remote"
          ? "bg-neutral-600 text-neutral-300"
          : "bg-neutral-900 text-neutral-400 hover:bg-neutral-700 hover:text-neutral-300"
      } transition-all`}
    >
      Generate Proof Remotely
    </button>
    <button
      onClick={() => onMethodChange("local")}
      className={`p-4 rounded-full ${
        proofMethod === "local"
          ? "bg-neutral-600 text-neutral-300"
          : "bg-neutral-900 text-neutral-400 hover:bg-neutral-700 hover:text-neutral-300"
      } transition-all`}
    >
      Upload Local Proof
    </button>
  </div>
);

export default ProofMethodSelector;