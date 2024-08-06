// @ts-nocheck
"use client";

import {
  useWalletInfo,
  useWeb3Modal,
  useWeb3ModalState,
} from "@web3modal/wagmi/react";
import { useState, ChangeEvent, useEffect, useCallback } from "react";
import {
  useReadContract,
  useWriteContract,
  useSwitchChain,
  useAccount,
} from "wagmi";

import { useZkRegex } from "zk-regex-sdk";
import { encodeAbiParameters } from "viem";
import PostalMime from "postal-mime";
import { sepolia } from "viem/chains";
import axios from "axios";

import { ProofOfLumaRegistryABI } from "../../abis/ProofOfLumaRegistry";
import Main from "../(screens)/StrobeCard";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { db } from "../util/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

const PROOF_OF_LUMA_REGISTRY_ADDRESS = process.env
  .NEXT_PUBLIC_PROOF_OF_LUMA_REGISTRY_ADDRESS as `0x${string}`;

export default function Home() {
  const { walletInfo } = useWalletInfo();
  const account = useAccount();
  const { open, close } = useWeb3Modal();
  const { selectedNetworkId } = useWeb3ModalState();
  const { switchChain } = useSwitchChain();
  const { createInputWorker, generateInputFromEmail } = useZkRegex();

  const [status, setStatus] = useState("idle");
  const [jobId, setJobId] = useState<string | null>(null);
  const [proof, setProof] = useState<any | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [encodedProof, setEncodedProof] = useState<`0x${string}` | null>(null);
  const [encodedPublicSignals, setEncodedPublicSignals] = useState<
    `0x${string}` | null
  >(null);

  // Check if user is whitelisted
  const { data: isWhitelisted, refetch: refetchWhitelist } = useReadContract({
    address: PROOF_OF_LUMA_REGISTRY_ADDRESS,
    abi: ProofOfLumaRegistryABI,
    functionName: "isUserJoined",
    args: [account.address],
    //   enabled: !!account.address,
  });

  // Join community write operation
  const { writeContractAsync: joinCommunity, isPending: isJoining } =
    useWriteContract();

  useEffect(() => {
    createInputWorker("testing/luma");
  }, []);

  useEffect(() => {
    if (account.address) {
      refetchWhitelist();
    }
  }, [account.address, refetchWhitelist]);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;
    setFile(file);

    setStatus("processing");
    const reader = new FileReader();
    reader.onload = async (e) => {
      const contents = e.target?.result;
      if (typeof contents !== "string") return;

      try {
        const parsed = await PostalMime.parse(contents);
        const inputs = await generateInputFromEmail("testing/luma", contents);

        const response = await axios.post(
          "https://registry-dev.zkregex.com/api/proof/testing/luma",
          inputs
        );
        if (response.data.id) {
          setJobId(response.data.id);
          setStatus("polling");
          pollJobStatus(response.data.id);
        }
      } catch (error) {
        console.error("Error processing email:", error);
        setStatus("error_processing");
      }
    };
    reader.readAsText(file);
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
          setProof(response.data.proof);
          encodeProof(response.data.proof, response.data.publicOutput);
          setStatus("proof_ready");
          return;
        }

        if (response.data.status === "FAILED") {
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
    console.log("Joining community...");
    console.log("encodedProof", encodedProof);
    console.log("encodedPublicSignals", encodedPublicSignals);
    try {
      await joinCommunity({
        address: PROOF_OF_LUMA_REGISTRY_ADDRESS,
        abi: ProofOfLumaRegistryABI,
        functionName: "join",
        args: [encodedProof, encodedPublicSignals],
      });
      setStatus("joining");
      // After successful join, refetch whitelist status
      await refetchWhitelist();
    } catch (error) {
      console.error("Error joining community:", error);
      setStatus("error_with_proof");
    }
  };

  console.log(isWhitelisted);

  const renderContent = () => {
    if (!account.address) {
      return (
        <button
          onClick={() => open()}
          className="p-4 bg-blue-500 text-white rounded-full"
        >
          Connect Wallet
        </button>
      );
    }

    if (isWhitelisted) {
      return (
        <div className="text-white">
          <h2>Welcome to the ZK Community!</h2>
          <p>This is where you'd see messages from other community members.</p>
        </div>
      );
    }

    return (
      <>
        <label className="mb-4 py-4 px-12 bg-neutral-700 text-neutral-400 rounded-lg cursor-pointer hover:bg-neutral-600 hover:text-neutral-300 transition duration-300">
          {"Select your registration email (.eml)"}
          <input
            type="file"
            accept=".eml"
            className="hidden"
            onChange={handleFileChange}
            disabled={
              status !== "idle" &&
              status !== "error" &&
              status !== "error_processing"
            }
          />
        </label>

        {file && (
          <button
            type="button"
            className="flex justify-center items-center p-4 mt-4 bg-neutral-400 text-neutral-800 rounded-full font-bold transition duration-300 hover:bg-neutral-700 hover:text-neutral-500"
            onClick={handleJoin}
            disabled={
              (status !== "proof_ready" && status !== "error_with_proof") ||
              isJoining
            }
          >
            {isJoining ? "Joining..." : "Join Community"}
          </button>
        )}
        <div className="flex justify-center items-center mt-4">
          <div className="w-6 h-6 border-2 border-t-2 border-neutral-400 rounded-full animate-spin"></div>
        </div>

        <div className="mt-4 text-neutral-400 animate-pulse ">
          {renderStatus()}
        </div>

        {/* spinner to indicate  */}
      </>
    );
  };

  const [estimatedTimeLeft, setEstimatedTimeLeft] = useState<number | null>(
    null
  );

  // const renderStatus = () => {
  //   switch (status) {
  //     case "idle":
  //       return "Upload an email to start the verification process.";
  //     case "processing":
  //       return "Processing email...";
  //     case "polling":
  //       return `Generating proof... Estimated time left: ${estimatedTimeLeft ? estimatedTimeLeft.toFixed(1) + ' seconds' : 'Calculating...'}`;
  //     case "proof_ready":
  //       return "Proof generated. Ready to join the community.";
  //     case "joining":
  //       return "Joining the community...";
  //     case "error":
  //       return "An error occurred. Please try again.";
  //     case "error_with_proof":
  //       return "An error occurred. You can retry joining the community without recreating the proof.";
  //     case "error_processing":
  //       return "An error occurred during email processing. Please check your email and try again.";
  //     default:
  //       return "";
  //   }
  // };

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

  const [showRenderContent, setShowRenderContent] = useState(false);
  const [showRenderBubble, setShowRenderBubble] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setShowRenderBubble(true);
      setTimeout(() => {
        setShowRenderContent(true);
      }, 1000);
    }, 5000);
  }, []);

  // if (!account.address) {
  //   return (
  //     <button
  //       onClick={() => open()}
  //       className="p-4 bg-blue-500 text-white rounded-full"
  //     >
  //       Connect Wallet
  //     </button>
  //   );
  // }

  const router = useRouter();
  const onJoin = () => {
    refetchWhitelist();
    if (isWhitelisted) {
      router.push("/main/1");
    }
  };

  const [whitelisted, setIsWhitelisted] = useState(false);

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
      }, 10000);
    }
  }, [isWhitelisted]);

  // if (isWhitelisted) {
  //   return (
  //     <Main>
  //       <div className="flex justify-center items-center text-white bg-red-500">
  //         <h2>Welcome to the ZK Community!</h2>
  //       </div>
  //     </Main>
  //   );
  // }

  if (!isWhitelisted || !account.address) {
    return (
      <div className="flex-col flex gap-6 bg-black justify-center items-center min-h-screen duration-1000 transition-all absolute top-0 left-0 w-screen">
        <Image
          src={"/ascii-art.png"}
          width={600}
          height={600}
          className="invert"
          alt="art"
        />

        <>
          {!account.address ? (
            <button
              onClick={() => {
                close();
                open();
              }}
              className="p-4 bg-neutral-900 text-neutral-400 hover:bg-neutral-600 hover:text-neutral-300 transotion-all rounded-full"
            >
              Connect Wallet
            </button>
          ) : (
            <>
              <label className="mb-4 py-2 px-12 bg-neutral-900 text-neutral-400 rounded-lg cursor-pointer hover:bg-neutral-600 hover:text-neutral-300 transition duration-300">
                {"Select your registration email (.eml)"}
                <input
                  type="file"
                  accept=".eml"
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={
                    status !== "idle" &&
                    status !== "error" &&
                    status !== "error_processing"
                  }
                />
              </label>

              <div className=" text-neutral-400 animate-pulse">
                {renderStatus()}
              </div>

              {file &&
                (status == "proof_ready" || status == "error_with_proof") && (
                  <button
                    type="button"
                    className="flex justify-center items-center p-4 mt-4 bg-neutral-400 text-neutral-800 rounded-full font-bold transition duration-300 hover:bg-neutral-700 hover:text-neutral-500"
                    onClick={handleJoin}
                    disabled={
                      (status !== "proof_ready" &&
                        status !== "error_with_proof") ||
                      isJoining
                    }
                  >
                    {isJoining ? "Joining..." : "Join Community"}
                  </button>
                )}
            </>
          )}
        </>
      </div>
    );
  }

  return (
    <Main>
      <div className="absolute bottom-6 left-0 right-0 flex items-center text-white justify-center">
        <div
          className="cursor-pointer text-xs opacity-60 animate-pulse"
          onClick={() => onJoin()}
        >
          press here to go to chat room or wait in a few seconds
        </div>
      </div>
    </Main>
  );
}
