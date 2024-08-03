/* eslint-disable no-unused-vars */
"use client";

import { useWalletInfo, useWeb3Modal, useWeb3ModalState } from '@web3modal/wagmi/react';
import { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { useWriteContract, useReadContract, useWaitForTransactionReceipt, useSwitchChain, useAccount } from "wagmi";
import { zkERC20ABI } from '../../abis/ZKERC20';
import { useGoogleAuth, fetchEmailList, fetchEmailsRaw, fetchProfile, useZkRegex } from "zk-regex-sdk";

import { encodeAbiParameters } from 'viem';
import PostalMime from 'postal-mime';

import { sepolia } from 'viem/chains';
import { config } from '../../config';
import axios from 'axios';

export interface ContentProps {
    entry: any
}

type RawEmailResponse = {
    subject: string;
    internalDate: string;
    decodedContents: string;
};

type Email = RawEmailResponse & { selected: boolean, inputs?: any, error?: string, body?: string };


// eslint-disable-next-line turbo/no-undeclared-env-vars
const PROOF_OF_LUMA_ADDRESS = process.env.NEXT_PUBLIC_PROOF_OF_LUMA_ADDRESS as `0x${string}`;

export default function Home() {
  const { walletInfo } = useWalletInfo();
  const account = useAccount({config});
  const { open } = useWeb3Modal();
  const { selectedNetworkId } = useWeb3ModalState();
  const { switchChain } = useSwitchChain();
  const { writeContract, data, error } = useWriteContract();
  const { isLoading, isSuccess } = useWaitForTransactionReceipt({ hash: data });

  const {
    createInputWorker,
    generateInputFromEmail,
    generateProofRemotely,
    proofStatus,
    inputWorkers,
} = useZkRegex();

    useEffect(() => {
        createInputWorker('testing/luma');
    }, [])
//   const {data: userBalance} = useReadContract({
//     abi: zkERC20ABI,
//     address: PROOF_OF_LUMA_ADDRESS,
//     functionName: 'balanceOf',
//     args: [
//       account.address
//     ]
//   });

  const [proofFileContent, setProofFileContent] = useState<any | null>(null);
  const [publicFileContent, setPublicFileContent] = useState<any | null>(null);
  const [proofFileName, setProofFileName] = useState<string | null>(null);
  const [publicFileName, setPublicFileName] = useState<string | null>(null);

  const [isPolling, setIsPolling] = useState(false);

  const pollJobStatus = async (jobId: string) => {
    setIsPolling(true);
    const pollInterval = 5000; // Poll every 5 seconds
    const maxAttempts = 60; // Maximum number of attempts (5 minutes)
    let attempts = 0;

    const poll = async () => {
      try {
        const response = await axios.get(`https://registry-dev.zkregex.com/api/job/${jobId}`);
        console.log('Job status:', response.data.status);

        if (response.data.status === 'COMPLETED') {
          console.log('Proof:', response.data.proof);
          setIsPolling(false);
          return;
        }

        if (response.data.status === 'FAILED') {
          console.error('Job failed:', response.data.error);
          setIsPolling(false);
          return;
        }

        attempts++;
        if (attempts >= maxAttempts) {
          console.error('Max polling attempts reached. Job did not complete in time.');
          setIsPolling(false);
          return;
        }

        setTimeout(poll, pollInterval);
      } catch (error) {
        console.error('Error polling job status:', error);
        setIsPolling(false);
      }
    };

    poll();
  };


  const handleMint = async () => {
    if (!walletInfo) {
      open();
      return;
    }

    if (Number(selectedNetworkId) !== sepolia.id) {
      switchChain({ chainId: sepolia.id });
      return;
    }
    
    if (!proofFileContent || !publicFileContent) {
      console.error("Please upload proof and public files");
      return;
    }

    const { pi_a, pi_b, pi_c } = proofFileContent;

    const pi_a_bigint = pi_a.slice(0, -1).map(BigInt);
    const pi_b_bigint = pi_b.slice(0, -1).map((pair: string[]) => pair.map(BigInt));
    const pi_c_bigint = pi_c.slice(0, -1).map(BigInt);

    const publicSignals_bigint = publicFileContent.map(BigInt);

    // Encoding proofA, proofB, proofC into bytes
    const proof = encodeAbiParameters(
      [
        { type: 'uint256[2]' },
        { type: 'uint256[2][2]' },
        { type: 'uint256[2]' }
      ],
      [pi_a_bigint, pi_b_bigint, pi_c_bigint]
    );

    // Encoding signals into bytes
    const publicSignals = encodeAbiParameters(
      [{ type: 'uint256[]' }],
      [publicSignals_bigint]
    );
    
    writeContract({ 
      abi: zkERC20ABI,
      address: PROOF_OF_LUMA_ADDRESS,
      functionName: 'mintWithProof',
      args: [
        proof,
        publicSignals
      ],
    });
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>, _setFileContent: Function, _setFileName: Function) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const contents = e.target?.result;
        if (typeof contents === "string") {
          let inputs: any;
          let error, body: string | undefined;
          const parsed = await PostalMime.parse(contents);
          try {
            inputs = await generateInputFromEmail('testing/luma', contents);
            body = inputs.emailBody ? Buffer.from(inputs.emailBody).toString('utf-8') : undefined;
            
            // Set the email inputs for later use
            // setEmailInputs(inputs);

            // Make a request to ZK regex registry
            try {
              const response = await axios.post('https://registry-dev.zkregex.com/api/proof/testing/luma', inputs);

              // Start polling for job status
              if (response.data.id) {
                pollJobStatus(response.data.id);
              }
            } catch (error) {
              console.error('Error making request to ZK regex registry:', error);
            }
          } catch (e: any) {
            error = e.toString();
          }
          const email: Email = {
            decodedContents: contents,
            internalDate: "" + (parsed.date ? Date.parse(parsed.date) : file.lastModified),
            subject: parsed.subject || file.name,
            selected: false,
            body,
            inputs,
            error,
          };
          _setFileContent(email);
          _setFileName(file.name);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    
    <div className="flex flex-col justify-center items-center min-h-screen bg-neutral-900">
         <div className="flex flex-col">
          <button
            className="p-4 bg-neutral-800 text-neutral-400 rounded-full font-bold transition duration-300 hover:bg-neutral-700 hover:text-neutral-500"
            onClick={() => open()}
          >
            {walletInfo ? "Disconnect wallet" : "Connect wallet"}
          </button>
        </div>

      <div className="bg-neutral-800 min-h-[100px] w-[400px] p-12 rounded-xl shadow-lg flex flex-col items-center mt-8">
        <label className="mb-4 py-4 px-12 bg-neutral-700 text-neutral-400 rounded-lg cursor-pointer hover:bg-neutral-600 hover:text-neutral-300 transition duration-300">
          {proofFileName ? proofFileName : "Select your registration email (.eml)"}
          <input
            type="file"
            accept=".eml"
            className="hidden"
            onChange={(e) => handleFileChange(e, setProofFileContent, setProofFileName)}
          />
        </label>
    
        <button
          type="button"
          className="flex justify-center items-center p-4 mt-4 bg-neutral-400 text-neutral-800 rounded-full font-bold transition duration-300 hover:bg-neutral-700 hover:text-neutral-500"
          onClick={handleMint}
        >
          Mint with proof
        </button>
        {isPolling && (
            <div className="mt-4 text-neutral-400">
            Polling for proof generation... Please wait.
            </div>
        )}
        
        {/* {isLoading && (
          <div className="flex items-center justify-center mt-8 text-center text-neutral-400 font-bold">
            <span className="pr-2">Submitting proof</span>
            <div className="border-4 border-neutral-600 border-t-neutral-500 rounded-full w-4 h-4 animate-spin"></div>
          </div>
        )}
        {isSuccess && (
          <div className="text-neutral-400 font-bold mt-8 text-center">
            <span> Tokens successfully minted ✅</span>
            <br />
            <a href={`https://sepolia.etherscan.io/tx/${data}`} className="underline" target="_blank" rel="noopener noreferrer">
              View on Etherscan
            </a>
          </div>
        )}
        {error && (
          <div className="text-neutral-400 font-bold mt-8 text-center">
            <span> Proof submittal failure ❌</span>
            <br />
            <span>{error.name}</span>
          </div>
        )} */}
      </div>
    </div>
  );
}
