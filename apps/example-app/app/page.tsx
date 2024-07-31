"use client";

import { useWalletInfo, useWeb3Modal, useWeb3ModalState } from '@web3modal/wagmi/react';
import { useState, useEffect, FormEvent } from "react";
import { useWriteContract, useWatchContractEvent, useWaitForTransactionReceipt, useSwitchChain } from "wagmi";
import { exampleAppABI } from '../abis/ExampleApp';
import { strobeCoreABI } from '../abis/StrobeCore';
import { toHex } from 'viem';
import { sepolia } from 'viem/chains';

const STROBE_CORE_ADDRESS = "0xB3E387886b0Bf305d166470F032e3ED89CD95F96";
const EXAMPLE_APP_ADDRESS = "0xa9cC78168465a4d2893f8ef237320a90E2f859f8";
const VERIFIER_ADDRESS = "0x2bf1b0C60d36cd0Ab014c5B169f18b1Ec85889F2";
const CIRCUIT_HASH = "ReplaceWithPinnedIPFSHash";

export default function Home() {
  const { walletInfo } = useWalletInfo();
  const { open } = useWeb3Modal();
  const { selectedNetworkId } = useWeb3ModalState()
  const { switchChain } = useSwitchChain();
  const { writeContract: request, data: requestHash, error: requestError } = useWriteContract();
  const { writeContract: submitProof, data: proofSubmitHash, error: proofSubmitError} = useWriteContract();
  const { isLoading: isRequestLoading, isSuccess: isRequestSuccess } = useWaitForTransactionReceipt({ hash: requestHash });
  const { isLoading: isProofLoading, isSuccess: isProofSuccess } = useWaitForTransactionReceipt({ hash: proofSubmitHash });

  const [requestId, setRequestId] = useState<bigint>();

  const [isValidProofFound, setIsValidProofFound] = useState(false);

  useWatchContractEvent({
    address: EXAMPLE_APP_ADDRESS,
    abi: exampleAppABI,
    eventName: 'ProofRequested',
    onLogs(logs: any) {
      if (logs[0]) {
        setRequestId(logs[0].args.requestId);
      }
    },
  });

  useWatchContractEvent({
    abi: exampleAppABI,
    address: EXAMPLE_APP_ADDRESS,
    eventName: 'ProofVerified',
    onLogs(logs: any) {
      if (logs[0] && logs[0].args.requestId === requestId && logs[0].args.success) {
        setIsValidProofFound(true);
      }
    },
  });

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
    
    request({ 
      abi: exampleAppABI,
      address: EXAMPLE_APP_ADDRESS,
      functionName: 'requestProof',
      args: [
        inputtedVerifierAddress,
        inputtedCircuitHash
      ],
    });
  };

  const handleProofSubmit = async () => {
    const proof = toHex('proof');
    const signals = toHex('signals');

    submitProof({
      abi: strobeCoreABI,
      address: STROBE_CORE_ADDRESS,
      functionName: 'submitProofById',
      args: [
        requestId,
        proof,
        signals
      ],
    })
  }

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
            Request proof
          </button>
          {isRequestLoading && (
            <div className="flex items-center justify-center mt-8 text-center text-neutral-400 font-bold">
              <span className="pr-2">Requesting a proof</span>
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
              <div className="flex justify-center mt-8">
                <button
                  type="button"
                  className="flex justify-center items-center p-4 bg-neutral-400 text-neutral-800 rounded-full font-bold transition duration-300 hover:bg-neutral-700 hover:text-neutral-500"
                  onClick={handleProofSubmit}
                >
                  Submit proof
                </button>
              </div>
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
          {isProofLoading && (
            <div className="flex items-center justify-center mt-8 text-center text-neutral-400 font-bold">
              <span className="pr-2">Submitting a sample proof</span>
              <div className="border-4 border-neutral-600 border-t-neutral-500 rounded-full w-4 h-4 animate-spin"></div>
            </div>
          )}
          {isProofSuccess && typeof requestId !== 'undefined' && (
            <div className="text-neutral-400 font-bold mt-8 text-center">
              <span> Proof successfully submitted ✅</span>
              <br/>
              <a href={`https://sepolia.etherscan.io/tx/${requestHash}`} className="underline" target="_blank" rel="noopener noreferrer">
                View on Etherscan
              </a>
            </div>
          )}
          {proofSubmitError && (
            <div className="text-neutral-400 font-bold mt-8 text-center">
              <span> Proof submittal failure ❌</span>
              <br/>
              {requestError && (
                <span>{proofSubmitError.name}</span>
              )}
            </div>
          )}
          {isRequestSuccess && !isValidProofFound ? (
            <div className="flex items-center justify-center mt-8 text-center text-neutral-400 font-bold">
            <span className="pr-2">Waiting on proof submission</span>
            <div className="border-4 border-neutral-600 border-t-neutral-500 rounded-full w-4 h-4 animate-spin"></div>
          </div>
          ) : isValidProofFound ? (
            <div className="text-neutral-400 font-bold mt-8 text-center">
              <span> Valid proof received ✅</span>
            </div>
          ) : null}
        </form>
      </main>
    </div>
  );
}
