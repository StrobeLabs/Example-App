/**
 * useProofGeneration Hook
 * 
 * This custom hook manages the process of generating and handling zero-knowledge proofs
 * for the Proof of Luma application. It supports both remote and local proof generation methods.
 * 
 * Key features:
 * - Handles file uploads for remote and local proof generation
 * - Manages proof generation status (idle, processing, polling, etc.)
 * - Encodes proofs and public signals for on-chain verification
 * - Provides estimated time left for remote proof generation
 * - Offers functions to reset state and change proof generation method
 * 
 * The hook integrates with the zk-regex-sdk for proof generation and uses axios for API calls.
 * It also handles file reading and parsing for both email contents and proof files.
 * 
 * @returns An object containing:
 *  - Various state variables (status, proofMethod, file, encodedProof, etc.)
 *  - Handler functions (handleRemoteProof, handleLocalProof, handleProofMethodChange, etc.)
 *  - Utility functions (resetState, setStatus)
 */

import { useState, useCallback, useEffect } from "react";
import { useZkRegex } from "zk-regex-sdk";
import PostalMime from "postal-mime";
import axios from "axios";
import { encodeAbiParameters } from "viem";

type ProofMethod = "remote" | "local" | null;
type Status =
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

export function useProofGeneration() {
  const { createInputWorker, generateInputFromEmail } = useZkRegex();
  const [status, setStatus] = useState<Status>("idle");
  const [proofMethod, setProofMethod] = useState<ProofMethod>(null);
  const [file, setFile] = useState<File | null>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [publicOutputFile, setPublicOutputFile] = useState<File | null>(null);
  const [encodedProof, setEncodedProof] = useState<`0x${string}` | null>(null);
  const [encodedPublicSignals, setEncodedPublicSignals] = useState<`0x${string}` | null>(null);
  const [selectedProofFileName, setSelectedProofFileName] = useState<string | null>(null);
  const [selectedPublicOutputFileName, setSelectedPublicOutputFileName] = useState<string | null>(null);
  const [estimatedTimeLeft, setEstimatedTimeLeft] = useState<number>();

  useEffect(() => {
    createInputWorker("testing/luma");
  }, []);

  /**
   * Handles the remote proof generation process.
   * This function is triggered when a file is selected for remote proof generation.
   * It reads the file contents, generates inputs, sends them to the API for proof generation,
   * and initiates polling for the job status.
   */
  const handleRemoteProof = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setFile(file);
    setStatus("processing");

    const reader = new FileReader();
    reader.onload = async (e) => {
      const contents = e.target?.result;
      if (typeof contents !== "string") return;

      try {
        await PostalMime.parse(contents);
        const inputs = await generateInputFromEmail("testing/luma", contents);
        const response = await axios.post(
          "https://registry-dev.zkregex.com/api/proof/testing/luma",
          inputs
        );
        if (response.data.id) {
          pollJobStatus(response.data.id);
          setStatus("polling");
        }
      } catch (error) {
        console.error("Error processing email:", error);
        setStatus("error_processing");
      }
    };
    reader.readAsText(file);
  };

  /**
   * Handles the local proof file selection.
   * This function is called when a user selects either a proof file or a public output file
   * for local proof generation. It updates the state with the selected file information.
   */
  const handleLocalProof = (
    event: React.ChangeEvent<HTMLInputElement>,
    fileType: "proof" | "publicOutput"
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      if (fileType === "proof") {
        setProofFile(file);
        setSelectedProofFileName(file.name);
      } else {
        setPublicOutputFile(file);
        setSelectedPublicOutputFileName(file.name);
      }
    }
  };

  /**
   * Polls the job status for remote proof generation.
   * This function repeatedly checks the status of a proof generation job
   * until it's completed, failed, or the maximum number of attempts is reached.
   */
  const pollJobStatus = async (id: string) => {
    const pollInterval = 5000;
    const maxAttempts = 60;
    let attempts = 0;

    const poll = async () => {
      try {
        const response = await axios.get(
          `https://registry-dev.zkregex.com/api/job/${id}`
        );
        setEstimatedTimeLeft(
          response.data.estimatedTimeLeft
        )

        if (response.data.status === "COMPLETED") {
          console.log("Proof generation completed");
          encodeProof(response.data.proof, response.data.publicOutput);
          setStatus("proof_ready");
          return;
        }

        if (
          response.data.status === "FAILED" ||
          response.data.status === "ERROR"
        ) {
          console.error("Job failed:", response.data.error);
          setStatus("error_processing");
          return;
        }

        attempts++;
        if (attempts >= maxAttempts) {
          console.error(
            "Max polling attempts reached. Job did not complete in time."
          );
          setStatus("error_processing");
          return;
        }

        setTimeout(poll, pollInterval);
      } catch (error) {
        console.error("Error polling job status:", error);
        setStatus("error_processing");
      }
    };

    poll();
  };

  /**
   * Resets the state of the hook.
   * This function clears all state variables related to proof generation,
   * effectively resetting the hook to its initial state.
   */
  const resetState = useCallback(() => {
    setStatus("idle");
    setFile(null);
    setProofFile(null);
    setPublicOutputFile(null);
    setEncodedProof(null);
    setEncodedPublicSignals(null);
    setSelectedProofFileName(null);
    setSelectedPublicOutputFileName(null);
  }, []);

  /**
   * Handles the change of proof generation method.
   * This function updates the proof method state and resets all other states
   * when the user switches between remote and local proof generation methods.
   */
  const handleProofMethodChange = (method: "remote" | "local" | null) => {
    setProofMethod(method);
    resetState();
  };

  /**
   * Encodes the proof and public signals.
   * This function takes the raw proof data and public output,
   * converts them to the appropriate format, and encodes them
   * for on-chain verification.
   */
  const encodeProof = useCallback((proofData: any, publicOutput: string[]) => {
    const { pi_a, pi_b, pi_c } = proofData;

    const pi_a_bigint = pi_a.slice(0, 2).map(BigInt) as [bigint, bigint];
    const pi_b_bigint = [
      [BigInt(pi_b[0][1]), BigInt(pi_b[0][0])],
      [BigInt(pi_b[1][1]), BigInt(pi_b[1][0])],
    ] as [[bigint, bigint], [bigint, bigint]];
    const pi_c_bigint = pi_c.slice(0, 2).map(BigInt) as [bigint, bigint];
    const publicSignals_bigint = publicOutput.map(BigInt);

    const encodedProof = encodeAbiParameters(
      [
        { type: "uint256[2]" },
        { type: "uint256[2][2]" },
        { type: "uint256[2]" },
      ],
      [pi_a_bigint, pi_b_bigint, pi_c_bigint]
    );

    const encodedPublicSignals = encodeAbiParameters(
      [{ type: "uint256[]" }],
      [publicSignals_bigint]
    );

    setEncodedProof(encodedProof);
    setEncodedPublicSignals(encodedPublicSignals);
  }, []);

  useEffect(() => {
    /**
     * Processes local proof files.
     * This function is called when both proof and public output files are selected.
     * It reads the contents of these files, encodes the proof, and updates the status.
     */
    async function processLocalProof() {
      if (proofFile && publicOutputFile) {
        setStatus("processing");
        try {
          const proofContent = await readFileContent(proofFile);
          const publicOutputContent = await readFileContent(publicOutputFile);
          encodeProof(
            JSON.parse(proofContent),
            JSON.parse(publicOutputContent)
          );
          setStatus("proof_ready");
        } catch (error) {
          console.error("Error processing local proof files:", error);
          setStatus("error_processing");
        }
      }
    }

    processLocalProof();
  }, [proofFile, publicOutputFile, encodeProof]);

  /**
   * Reads the content of a file.
   * This utility function reads a file and returns its content as a string.
   */
  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  };

  return {
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
    resetState,
    setStatus,
  };
}