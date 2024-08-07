// @ts-nocheck
"use client";

import React, { useState, ChangeEvent, useEffect, useCallback } from "react";
import { useAccount, useReadContract, useWriteContract, useSwitchChain } from "wagmi";
import { useWeb3Modal, useWeb3ModalState, useWalletInfo } from "@web3modal/wagmi/react";
import { useZkRegex } from "zk-regex-sdk";
import { encodeAbiParameters } from "viem";
import PostalMime from "postal-mime";
import axios from "axios";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ProofOfLumaRegistryABI } from "../../abis/ProofOfLumaRegistry";
import Main from "../(screens)/StrobeCard";
import { db } from "../util/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

const PROOF_OF_LUMA_REGISTRY_ADDRESS = process.env.NEXT_PUBLIC_PROOF_OF_LUMA_REGISTRY_ADDRESS as `0x${string}`;

export default function Home() {
  const { account, address, isConnected } = useAccount();
  const { open, close } = useWeb3Modal();
  const { createInputWorker, generateInputFromEmail } = useZkRegex();
  const router = useRouter();

  const [status, setStatus] = useState("idle");
  const [proofMethod, setProofMethod] = useState<"remote" | "local" | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [publicOutputFile, setPublicOutputFile] = useState<File | null>(null);
  const [encodedProof, setEncodedProof] = useState<`0x${string}` | null>(null);
  const [encodedPublicSignals, setEncodedPublicSignals] = useState<`0x${string}` | null>(null);
  const [estimatedTimeLeft, setEstimatedTimeLeft] = useState<number | null>(null);
  
  const [selectedProofFileName, setSelectedProofFileName] = useState<string | null>(null);
  const [selectedPublicOutputFileName, setSelectedPublicOutputFileName] = useState<string | null>(null);
  const [whitelisted, setIsWhitelisted] = useState(false);

  const { data: isWhitelisted, refetch: refetchWhitelist } = useReadContract({
    address: PROOF_OF_LUMA_REGISTRY_ADDRESS,
    abi: ProofOfLumaRegistryABI,
    functionName: "isUserJoined",
    args: [account?.address],
  });

  const { writeContractAsync: joinCommunity, isPending: isJoining } = useWriteContract();

  useEffect(() => {
    createInputWorker("testing/luma");
  }, []);

  useEffect(() => {
    if (account?.address) {
      refetchWhitelist();
    }
  }, [account?.address, refetchWhitelist]);

  const handleRemoteProof = async (event: ChangeEvent<HTMLInputElement>) => {
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
        const response = await axios.post("https://registry-dev.zkregex.com/api/proof/testing/luma", inputs);
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

  // Once we have the two local files we can process the proof.
  useEffect(() => {
    async function processLocalProof() {
      if (proofFile && publicOutputFile) {
        console.log("Both proof and public output files are set.");
        setStatus("processing");
        try {
          const proofContent = await readFileContent(proofFile);
          const publicOutputContent = await readFileContent(publicOutputFile);
          encodeProof(JSON.parse(proofContent), JSON.parse(publicOutputContent));
          setStatus("proof_ready");
        } catch (error) {
          console.error("Error processing local proof files:", error);
          setStatus("error_processing");
        }
      }
    }

    processLocalProof();
  }, [proofFile, publicOutputFile]);

  const handleLocalProof = async (event: ChangeEvent<HTMLInputElement>, fileType: 'proof' | 'publicOutput') => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    if (fileType === 'proof') {
      setProofFile(file);
      setSelectedProofFileName(file.name);
    } else {
      setPublicOutputFile(file);
      setSelectedPublicOutputFileName(file.name);
    }
  };

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  };

  const pollJobStatus = async (id: string) => {
    const pollInterval = 5000;
    const maxAttempts = 60;
    let attempts = 0;
  
    const poll = async () => {
      try {
        const response = await axios.get(
          `https://registry-dev.zkregex.com/api/job/${id}`
        );

        console.log("Job status:", response.data.status);
  
        if (response.data.status === "COMPLETED") {
          console.log("Proof generation completed");
          encodeProof(response.data.proof, response.data.publicOutput);
          setStatus("proof_ready");
          return;
        }
  
        if (response.data.status === "FAILED" || response.data.status === "ERROR") {
          console.error("Job failed:", response.data.error);
          setStatus("error_processing");
          return;
        }
  
        setEstimatedTimeLeft(response.data.estimatedTimeLeft);
  
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
  
  const handleProofMethodChange = (method: "remote" | "local") => {
    setProofMethod(method);
    resetState();
  };

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

  const handleJoin = async () => {
    if (!encodedProof || !encodedPublicSignals) return;
    try {
      await joinCommunity({
        address: PROOF_OF_LUMA_REGISTRY_ADDRESS,
        abi: ProofOfLumaRegistryABI,
        functionName: "join",
        args: [encodedProof, encodedPublicSignals],
      });
      setStatus("joining");
      await refetchWhitelist();
    } catch (error) {
      console.error("Error joining community:", error);
      setStatus("error_with_proof");
    }
  };

  const renderStatus = () => {
    switch (status) {
      case "idle":
        return "Ready to verify! Upload your email to get started.";
      case "processing":
        return "Analyzing your email...";
      case "polling":
        return `Creating your unique proof... ${estimatedTimeLeft ? `About ${estimatedTimeLeft.toFixed(1)} seconds left` : "Calculating time..."}`;
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
      default:
        return "";
    }
  };

  useEffect(() => {
    if (isWhitelisted) {
      const fetch = async () => {
        const userRef = doc(db, "users", account.address);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          setIsWhitelisted(userDoc.data().isWhitelisted);
        } else {
          const onChainStatus = false;
          await setDoc(userRef, { isWhitelisted: onChainStatus });
          setIsWhitelisted(onChainStatus);
        }
      };
      fetch();

      setTimeout(() => {
        router.push("/main/1");
      }, 3000);
    }
  }, [isWhitelisted]);

  if (!isWhitelisted || !account?.address) {
    return (
      <div className="flex-col flex gap-6 bg-black justify-center items-center min-h-screen duration-1000 transition-all absolute top-0 left-0 w-screen">
        <Image
          src={"/ascii-art.png"}
          width={400}
          height={400}
          className="invert"
          alt="art"
        />
          {!isConnected ? (
            <button
              onClick={open}
              className="p-4 bg-neutral-900 text-neutral-400 hover:bg-neutral-600 hover:text-neutral-300 transition-all rounded-full"
            >
              Connect Wallet
            </button>
          ) : (
            <div className="text-neutral-400">
              {isWhitelisted ? (
                "Welcome to the community!"
              ) : (
                "Connected! Please proceed with proof generation."
              )}
            </div>
          )}
          <>
            <div className="flex gap-4">
              <button
                // onClick={() => setProofMethod("remote")}
                onClick={() => handleProofMethodChange("remote")}
                className={`p-4 rounded-full ${
                  proofMethod === "remote"
                    ? "bg-neutral-600 text-neutral-300"
                    : "bg-neutral-900 text-neutral-400 hover:bg-neutral-700 hover:text-neutral-300"
                } transition-all`}
              >
                Generate Proof Remotely
              </button>
              <button
                // onClick={() => setProofMethod("local")}
                onClick={() => handleProofMethodChange("local")}
                className={`p-4 rounded-full ${
                  proofMethod === "local"
                    ? "bg-neutral-600 text-neutral-300"
                    : "bg-neutral-900 text-neutral-400 hover:bg-neutral-700 hover:text-neutral-300"
                } transition-all`}
              >
                Upload Local Proof
              </button>
            </div>

            {proofMethod === "remote" && (
              <label className="mb-4 py-2 px-12 bg-neutral-900 text-neutral-400 rounded-lg cursor-pointer hover:bg-neutral-600 hover:text-neutral-300 transition duration-300">
                Select your registration email (.eml)
                <input
                  type="file"
                  accept=".eml"
                  className="hidden"
                  onChange={handleRemoteProof}
                  disabled={status !== "idle" && status !== "error" && status !== "error_processing"}
                />
              </label>
            )}

            {proofMethod === "local" && (
              <>
                <label className="mb-4 py-2 px-12 bg-neutral-900 text-neutral-400 rounded-lg cursor-pointer hover:bg-neutral-600 hover:text-neutral-300 transition duration-300">
                {selectedProofFileName || "Upload proof.json"}
                  <input
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={(e) => handleLocalProof(e, 'proof')}
                    disabled={status !== "idle" && status !== "error" && status !== "error_processing"}
                  />
                </label>
                <label className="mb-4 py-2 px-12 bg-neutral-900 text-neutral-400 rounded-lg cursor-pointer hover:bg-neutral-600 hover:text-neutral-300 transition duration-300">
                {selectedPublicOutputFileName || "Upload publicOutput.json"}
                  <input
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={(e) => handleLocalProof(e, 'publicOutput')}
                    disabled={status !== "idle" && status !== "error" && status !== "error_processing"}
                  />
                </label>
              </>
            )}

            <div className="text-neutral-400 animate-pulse">
              {renderStatus()}
            </div>

            {((proofMethod === "remote" && file) || (proofMethod === "local" && proofFile && publicOutputFile)) &&
              (status === "proof_ready" || status === "error_with_proof") && (
                <button
                  type="button"
                  className="flex justify-center items-center p-4 mt-4 bg-neutral-400 text-neutral-800 rounded-full font-bold transition duration-300 hover:bg-neutral-700 hover:text-neutral-500"
                  onClick={handleJoin}
                  disabled={(status !== "proof_ready" && status !== "error_with_proof") || isJoining}
                >
                  {isJoining ? "Joining..." : "Join Community"}
                </button>
              )}

            <Link href="/local-proof-instructions" className="text-neutral-400 hover:text-neutral-300 transition-all">
              How to generate proof locally
            </Link>
          </>
      </div>
    );
  }

  return (
    <Main>
      <div className="absolute bottom-6 left-0 right-0 flex items-center text-white justify-center">
        <div
          className="cursor-pointer text-xs opacity-60 animate-pulse"
          onClick={() => router.push("/main/1")}
        >
          press here to go to chat room or wait in a few seconds
        </div>
      </div>
    </Main>
  );
}