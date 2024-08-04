/* eslint-disable turbo/no-undeclared-env-vars */
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
import { ProofTypeZKEmailABI } from '../../abis/ProofTypeZKEmail';
// import { VerifierABI } from '../../abis/Verifier';
// import { AlwaysTrueABI } from '../../abis/AlwaysTrue';

export interface ContentProps {
    entry: any
}

type RawEmailResponse = {
    subject: string;
    internalDate: string;
    decodedContents: string;
};

type Email = RawEmailResponse & { selected: boolean, inputs?: any, error?: string, body?: string };

const PROOF_OF_LUMA_ADDRESS = process.env.NEXT_PUBLIC_PROOF_OF_LUMA_ADDRESS as `0x${string}`;
const ORIGINAL_VERIFIER_ADDRESS = process.env.NEXT_PUBLIC_ORIGINAL_VERIFIER_ADDRESS as `0x${string}`;
const ALWAYS_TRUE_VERIFIER_ADDRESS = process.env.NEXT_PUBLIC_ALWAYS_TRUE_VERIFIER_ADDRESS as `0x${string}`;

export default function Home() {
  const { walletInfo } = useWalletInfo();
  const account = useAccount({config});
  const { open } = useWeb3Modal();
  const { selectedNetworkId } = useWeb3ModalState();
  const { switchChain } = useSwitchChain();

  const {
    createInputWorker,
    generateInputFromEmail,
    generateProofRemotely,
    proofStatus,
    inputWorkers,
} = useZkRegex();

const proofFileContent ={
    "pi_a": [
      "7370313145627934131602118357897898916717618578159426262946590954879756375916",
      "6043547729046053022107211981727500814222551672524440634168509563899521706396",
      "1"
    ],
    "pi_b": [
      [
        "2875350222504049741478121740882888432895674998925068198348757919374046279263",
        "9062127779461192832030002477933768267498215226636695418013023415950210148142"
      ],
      [
        "14835440432095150452474876822672996860158752354080400049488448201316192214054",
        "12014482374024788210698484050763000125068570965612708037821696537993105075150"
      ],
      [
        "1",
        "0"
      ]
    ],
    "pi_c": [
      "6272976354732170410147629563150293829545252029606764442076188018565636154751",
      "12244609440177224232358835088211848618737425096876659156296408460039021596060",
      "1"
    ],
    "protocol": "groth16",
    "curve": "bn128"
  }

const publicSignalsArr = [
    "9283862132906206173231503844388353637958035881803629232600094123534923017779",
    "11524861921609704033742061508122713605071039312553788599207905682035",
    "0",
    "0",
    "205730529291895442492427822992419079830664464590237701454167029857395369298",
    "111490392858735",
    "0"
  ]

// Convert proof components to BigInt with explicit typing
const pi_a: [bigint, bigint] = proofFileContent.pi_a.slice(0, 2).map(BigInt) as [bigint, bigint];
const pi_b: [[bigint, bigint], [bigint, bigint]] = proofFileContent.pi_b.slice(0, 2).map(pair => 
  pair.map(BigInt) as [bigint, bigint]
) as [[bigint, bigint], [bigint, bigint]];
const pi_c: [bigint, bigint] = proofFileContent.pi_c.slice(0, 2).map(BigInt) as [bigint, bigint];

// Encode the proof
const proof = encodeAbiParameters(
  [
    { type: 'uint256[2]' },
    { type: 'uint256[2][2]' },
    { type: 'uint256[2]' }
  ],
  [pi_a, pi_b, pi_c]
);

// Convert public signals to BigInt
const publicSignals_bigint = publicSignalsArr.map(BigInt);

// Encode public signals
const publicSignals = encodeAbiParameters(
  [{ type: 'uint256[]' }],
  [publicSignals_bigint]
);

console.log('Encoded proof:', proof);
console.log('Encoded public signals:', publicSignals);
    
const { data, error } = useReadContract({ 
    address: PROOF_OF_LUMA_ADDRESS,
    abi: ProofTypeZKEmailABI,
    functionName: 'verify',
    args: [
      proof,
      publicSignals
    ],
  });
  
    if (data) {
    console.log('data', data);
    }
    if (error) {
    console.error('error', error);
    }

    useEffect(() => {
        createInputWorker('testing/luma');
    }, [])

  const [isPolling, setIsPolling] = useState(false);

  const pollJobStatus = async (jobId: string) => {
    setIsPolling(true);
    const pollInterval = 5000; 
    const maxAttempts = 60;
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
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
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
        //   _setFileContent(email);
        //   _setFileName(file.name);
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
          {"Select your registration email (.eml)"}
          <input
            type="file"
            accept=".eml"
            className="hidden"
            onChange={(e) => handleFileChange(e)}
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
      </div>
    </div>
  );
}
