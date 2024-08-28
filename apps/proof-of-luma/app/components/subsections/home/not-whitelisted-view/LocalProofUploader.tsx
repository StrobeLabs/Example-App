/**
 * LocalProofUploader Component
 * 
 * This component provides a user interface for uploading local proof files
 * in the proof-of-luma application. It allows users to upload two JSON files:
 * a proof file and a public output file.
 * 
 * The component renders two styled labels that act as file input buttons.
 * When clicked, each opens a file selection dialog for the user to choose
 * the respective JSON file. The selected files are then processed by the
 * handleLocalProof function passed as a prop.
 * 
 * The component's interactivity is controlled by the 'status' prop, which
 * enables the inputs only when the application is in certain states (e.g.,
 * idle or error states).
 * 
 * Props:
 * - handleLocalProof: Function to handle the file selection event
 * - selectedProofFileName: Name of the selected proof file
 * - selectedPublicOutputFileName: Name of the selected public output file
 * - status: Current status of the proof generation process
 */

import React from "react";

interface LocalProofUploaderProps {
  handleLocalProof: (
    event: React.ChangeEvent<HTMLInputElement>,
    fileType: "proof" | "publicOutput"
  ) => void;
  selectedProofFileName: string | null;
  selectedPublicOutputFileName: string | null;
  status: string;
}

const LocalProofUploader: React.FC<LocalProofUploaderProps> = ({
  handleLocalProof,
  selectedProofFileName,
  selectedPublicOutputFileName,
  status,
}) => {
  const isInputEnabled = ["idle", "error", "error_processing"].includes(status);

  return (
    <>
      <label className="mb-4 py-2 px-12 bg-neutral-900 text-neutral-400 rounded-lg cursor-pointer hover:bg-neutral-600 hover:text-neutral-300 transition duration-300">
        {selectedProofFileName || "Upload proof.json"}
        <input
          type="file"
          accept=".json"
          className="hidden"
          onChange={(e) => handleLocalProof(e, "proof")}
          disabled={!isInputEnabled}
        />
      </label>
      <label className="mb-4 py-2 px-12 bg-neutral-900 text-neutral-400 rounded-lg cursor-pointer hover:bg-neutral-600 hover:text-neutral-300 transition duration-300">
        {selectedPublicOutputFileName || "Upload publicOutput.json"}
        <input
          type="file"
          accept=".json"
          className="hidden"
          onChange={(e) => handleLocalProof(e, "publicOutput")}
          disabled={!isInputEnabled}
        />
      </label>
    </>
  );
};

export default LocalProofUploader;