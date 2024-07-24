"use client";

import { useWalletInfo, useWeb3Modal, useWeb3ModalState } from '@web3modal/wagmi/react';
import { useState, useEffect, FormEvent } from "react";
import { useWriteContract, useWatchContractEvent, useWaitForTransactionReceipt, useSwitchChain } from "wagmi";
import { exampleAppABI } from '../abis/ExampleApp';
import { sepolia } from 'viem/chains';

const EXAMPLE_APP_ADDRESS = "0x33424318De604A3CC553D1c34Cdfb137954bb74B";
const VERIFIER_ADDRESS = "0x9bD50303f82D6E08A145AAE3eF8362ae5dbC0D73";
const CIRCUIT_HASH = "ReplaceWithPinnedIPFSHash";

export default function Home() {
  const { walletInfo } = useWalletInfo();
  const { open } = useWeb3Modal();
  const { selectedNetworkId } = useWeb3ModalState()
  const { switchChain } = useSwitchChain();
  const { writeContract, data: requestHash, error: requestError } = useWriteContract();
  const { isLoading: isRequestLoading, isSuccess: isRequestSuccess } = useWaitForTransactionReceipt({ hash: requestHash });

  const [isProofPending, setIsProofPending] = useState(false);
  const [isProofSuccess, setIsProofSuccess] = useState(false);

  const handleRequest = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!walletInfo) {
      open();
      return;
    }

    if (Number(selectedNetworkId) !== sepolia.id) {
      switchChain({ chainId: sepolia.id });
      return;
    }

    const inputtedVerifierAddress = (event.target as HTMLFormElement).verifierAddress.value;
    const inputtedCircuitHash = (event.target as HTMLFormElement).circuitIPFSHash.value;
    
    writeContract({ 
      abi: exampleAppABI,
      address: EXAMPLE_APP_ADDRESS,
      functionName: 'requestProof',
      args: [
        inputtedVerifierAddress,
        inputtedCircuitHash
      ],
    });
  };

  useEffect(() => {
    if (isRequestSuccess) {
      setIsProofPending(true);
    }
  }, [isRequestSuccess]);

  useWatchContractEvent({
    abi: exampleAppABI,
    address: EXAMPLE_APP_ADDRESS,
    eventName: 'ProofVerified',
    onLogs(logs) {
      console.log(logs);
      setIsProofPending(false);
      setIsProofSuccess(true);
    },
  });

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-neutral-900">
      <div className="mb-8">
        {walletInfo && (
          <button
            className="p-4 bg-neutral-800 text-neutral-400 rounded-full font-bold transition duration-300 hover:bg-neutral-700 hover:text-neutral-500"
            onClick={() => open()}
          >
            Disconnect
          </button>
        )}
      </div>
      <main className="bg-neutral-800 min-h-[350px] w-[400px] p-12 rounded-xl shadow-lg flex flex-col items-center">
        <form onSubmit={handleRequest} className="flex flex-col items-center w-full">
          <div className="mb-10 w-full flex flex-col items-center">
            <label htmlFor="verifierAddress" className="mb-2 font-bold text-neutral-400">
              Verifier contract address
            </label>
            <input
              type="text"
              id="verifierAddress"
              defaultValue={VERIFIER_ADDRESS}
              required
              className="w-full p-3 rounded-lg bg-neutral-700 text-neutral-400 text-center focus:outline-neutral-400"
            />
          </div>
          <div className="mb-10 w-full flex flex-col items-center">
            <label htmlFor="circuitIPFSHash" className="mb-2 font-bold text-neutral-400">
              Circuit IPFS hash
            </label>
            <input
              type="text"
              id="circuitIPFSHash"
              defaultValue={CIRCUIT_HASH}
              required
              className="w-full p-3 rounded-lg bg-neutral-700 text-neutral-400 text-center focus:outline-neutral-400"
            />
          </div>
          <button
            type="submit"
            className="flex justify-center items-center p-4 bg-neutral-400 text-neutral-800 rounded-full font-bold transition duration-300 hover:bg-neutral-700 hover:text-neutral-500"
          >
            Request Proof
          </button>
          {isRequestLoading && (
            <div className="flex items-center justify-center mt-8 text-center text-neutral-400 font-bold">
              <span className="pr-2">Request transaction pending</span>
              <div className="border-4 border-neutral-600 border-t-neutral-500 rounded-full w-4 h-4 animate-spin"></div>
            </div>
          )}
          {isRequestSuccess && (
            <div className="text-neutral-400 font-bold mt-8 text-center">
              <span> Request successful ✅</span>
              <br/>
              {requestHash && (
                <a href={`https://sepolia.etherscan.io/tx/${requestHash}`} className="underline" target="_blank" rel="noopener noreferrer">
                  View on Etherscan
                </a>
              )}
            </div>
          )}
          {requestError && (
            <div className="text-neutral-400 font-bold mt-8 text-center">
              <span> Request failure ❌</span>
              <br/>
              {requestError && (
                <span>{requestError.name}</span>
              )}
            </div>
          )}
          {isProofPending && (
            <div className="flex items-center justify-center mt-8 text-center text-neutral-400 font-bold">
              <span className="pr-2">Waiting for valid proof</span>
              <div className="border-4 border-neutral-600 border-t-neutral-500 rounded-full w-4 h-4 animate-spin"></div>
            </div>
          )}
          {isProofSuccess && (
            <div className="text-neutral-400 font-bold mt-8 text-center">
              <span> Proof successful ✅</span>
              <br/>
              {/* Display transaction hash */}
            </div>
          )}
        </form>
      </main>
    </div>
  );
}
