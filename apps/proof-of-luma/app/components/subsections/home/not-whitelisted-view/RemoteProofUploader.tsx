/**
 * RemoteProofUploader Component
 * 
 * This component provides a user interface for uploading a registration email file (.eml)
 * to generate a remote proof. It's part of the proof generation process in the 
 * proof-of-luma application.
 * 
 * The component renders as a styled label that acts as a file input button. When clicked,
 * it opens a file selection dialog for the user to choose an .eml file. The selected file
 * is then processed by the handleRemoteProof function passed as a prop.
 * 
 * The component's interactivity is controlled by the 'status' prop, which disables the
 * input when the application is in certain states (e.g., processing a proof).
 * 
 * Props:
 * - handleRemoteProof: Function to handle the file selection event
 * - status: Current status of the proof generation process
 */

import React from "react";

interface RemoteProofUploaderProps {
  handleRemoteProof: (event: React.ChangeEvent<HTMLInputElement>) => void;
  status: string;
}

const RemoteProofUploader: React.FC<RemoteProofUploaderProps> = ({
  handleRemoteProof,
  status,
}) => (
  <label className="mb-4 py-2 px-12 bg-neutral-900 text-neutral-400 text-center rounded-lg cursor-pointer hover:bg-neutral-600 hover:text-neutral-300 transition duration-300">
    Select your registration email (.eml)
    <input
      type="file"
      accept=".eml"
      className="hidden"
      onChange={handleRemoteProof}
      disabled={
        status !== "idle" &&
        status !== "error" &&
        status !== "error_processing"
      }
    />
  </label>
);

export default RemoteProofUploader;