"use client";

import { useWalletInfo, useWeb3Modal, useWeb3ModalState } from '@web3modal/wagmi/react';
import { useState, ChangeEvent, FormEvent } from "react";
import { useWriteContract, useReadContract, useWaitForTransactionReceipt, useSwitchChain, useAccount } from "wagmi";
import { zkERC20ABI } from '../../abis/ZKERC20';
import { encodeAbiParameters } from 'viem';
import { sepolia } from 'viem/chains';
import { config } from '../../config';

const ZKERC20_ADDRESS = process.env.NEXT_PUBLIC_ZKERC20_ADDRESS as `0x${string}`;

export default function Home() {
  const { walletInfo } = useWalletInfo();
  const account = useAccount({config});
  const { open } = useWeb3Modal();
  const { selectedNetworkId } = useWeb3ModalState();
  const { switchChain } = useSwitchChain();
  const { writeContract, data, error } = useWriteContract();
  const { isLoading, isSuccess } = useWaitForTransactionReceipt({ hash: data });

  const {data: userBalance} = useReadContract({
    abi: zkERC20ABI,
    address: ZKERC20_ADDRESS,
    functionName: 'balanceOf',
    args: [
      account.address
    ]
  });

  const [proofFileContent, setProofFileContent] = useState<any | null>(null);
  const [publicFileContent, setPublicFileContent] = useState<any | null>(null);
  const [proofFileName, setProofFileName] = useState<string | null>(null);
  const [publicFileName, setPublicFileName] = useState<string | null>(null);

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

     console.log(proof);
      console.log(publicSignals);
    
    writeContract({ 
      abi: zkERC20ABI,
      address: ZKERC20_ADDRESS,
      functionName: 'mintWithProof',
      args: [
        proof,
        publicSignals
      ],
    });
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>, setFileContent: Function, setFileName: Function) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        try {
          const jsonContent = JSON.parse(content);
          setFileContent(jsonContent);
        } catch (error) {
          console.error("Error parsing JSON file:", error);
        }
        setFileName(file.name);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-neutral-900">
      {walletInfo && (
        <div className="flex flex-col">
          <button
            className="p-4 bg-neutral-800 text-neutral-400 rounded-full font-bold transition duration-300 hover:bg-neutral-700 hover:text-neutral-500"
            onClick={() => open()}
          >
            Disconnect
          </button>
          <span className="text-neutral-400 font-bold mt-8">
            You have {userBalance?.toString()} tokens
          </span>
        </div>
      )}
      <div className="bg-neutral-800 min-h-[100px] w-[400px] p-12 rounded-xl shadow-lg flex flex-col items-center mt-8">
        <label className="mb-4 py-4 px-12 bg-neutral-700 text-neutral-400 rounded-lg cursor-pointer hover:bg-neutral-600 hover:text-neutral-300 transition duration-300">
          {proofFileName ? proofFileName : "Choose proof.json file"}
          <input
            type="file"
            accept=".json"
            className="hidden"
            onChange={(e) => handleFileChange(e, setProofFileContent, setProofFileName)}
          />
        </label>
        <label className="mb-4 py-4 px-12 mt-4 bg-neutral-700 text-neutral-400 rounded-lg cursor-pointer hover:bg-neutral-600 hover:text-neutral-300 transition duration-300">
          {publicFileName ? publicFileName : "Choose public.json file"}
          <input
            type="file"
            accept=".json"
            className="hidden"
            onChange={(e) => handleFileChange(e, setPublicFileContent, setPublicFileName)}
          />
        </label>
        <button
          type="button"
          className="flex justify-center items-center p-4 mt-4 bg-neutral-400 text-neutral-800 rounded-full font-bold transition duration-300 hover:bg-neutral-700 hover:text-neutral-500"
          onClick={handleMint}
        >
          Mint with proof
        </button>
        {isLoading && (
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
        )}
      </div>
    </div>
  );
}
