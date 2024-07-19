"use client";

import { 
  useWalletInfo,
  useWeb3Modal
} from '@web3modal/wagmi/react';

import { useState, FormEvent } from "react";

import { 
  useWriteContract,
  useWatchContractEvent 
} from "wagmi";

export default function Home() {
  const { walletInfo } = useWalletInfo();
  const { open, close } = useWeb3Modal();

  const { writeContract, error } = useWriteContract();

  const [isRequestPending, setIsRequestPending] = useState(false);
  const [isRequestSuccess, setIsRequestSuccess] = useState(false);
  const [isRequestFailure, setIsRequestFailure] = useState(false);
  const [isProofPending, setIsProofPending] = useState(false);
  const [isProofSuccess, setIsProofSuccess] = useState(false);
  const [isProofFailure, setIsProofFailure] = useState(false);
  const [requestTransactionHash, setRequestTransactionHash] = useState<string | null>(null);
  const [proofTransactionHash, setProofTransactionHash] = useState<string | null>(null);

  const exampleAppContractAddress = "0xREPLACEWITHDEPLOYEDCONTRACTADDRESS";
  const verifierAddress = "0xREPLACEWITHDEPLOYEDVERIFIERADDRESS";
  const circuitHash = "ReplaceWithPinnedIPFSHash";

  const exampleAppContractAbi = [{"type":"function","name":"requestProof","inputs":[{"name":"verifierAddress","type":"address","internalType":"address"},{"name":"ipfsHash","type":"string","internalType":"string"}],"outputs":[],"stateMutability":"nonpayable"},];

  const handleRequest = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!walletInfo) {
      open();
      return;
    }

    setIsRequestPending(true);
    setIsRequestSuccess(false);
    setIsRequestFailure(false);

    const inputtedVerifierAddress = (event.target as HTMLFormElement).verifierAddress.value;
    const inputtedCircuitHash = (event.target as HTMLFormElement).circuitIPFSHash.value;

    try {
      console.log("Form submitted with:");
      console.log("Verifier contract address:", inputtedVerifierAddress);
      console.log("Circuit IPFS hash:", inputtedCircuitHash);

    //   await writeContract({ 
    //     abi: exampleAppContractAbi,
    //     address: exampleAppContractAddress,
    //     functionName: 'requestProof',
    //     args: [
    //       inputtedVerifierAddress,
    //       inputtedCircuitHash
    //     ],
    //  });

    await new Promise((resolve) => setTimeout(resolve, 5000)); // Replace this with proof event watch

      // Simulated transaction hash
      const txHash = "https://sepolia.etherscan.io/";
      setRequestTransactionHash(txHash);

      setIsRequestSuccess(true);

      watchForProof();

    } catch (error) {
      // If transaction fails
      setIsRequestFailure(true);
    } finally {
      setIsRequestPending(false);
    }
  };

  const watchForProof = async () => {
    setIsProofPending(true);
    setIsProofSuccess(false);
    setIsProofFailure(false);

    try {
      await new Promise((resolve) => setTimeout(resolve, 5000)); // Replace this with proof event watch
      
      // Simulated transaction hash
      const txHash = "https://sepolia.etherscan.io/";
      setProofTransactionHash(txHash);

      setIsProofSuccess(true);

    } catch (error) {
      // If transaction fails
      setIsProofFailure(true);
    } finally {
      setIsProofPending(false);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-neutral-900">
      <div className="mb-8">
      {walletInfo ? (
        <button
          className="p-4 bg-neutral-800 text-neutral-400 rounded-full font-bold transition duration-300 hover:bg-neutral-700 hover:text-neutral-500"
          onClick={(e) => open()}
        >
          Disconnect
        </button>
      ): null}
      </div>
      <main className="bg-neutral-800 min-h-[350px] w-[400px] p-12 rounded-xl shadow-lg flex flex-col items-center">
        <form
          onSubmit={handleRequest}
          className="flex flex-col items-center w-full"
        >
          <div className="mb-10 w-full flex flex-col items-center">
            <label
              htmlFor="verifierAddress"
              className="mb-2 font-bold text-neutral-400"
            >
              Verifier contract address
            </label>
            <input
              type="text"
              id="verifierAddress"
              defaultValue={verifierAddress}
              required
              className="w-full p-3 rounded-lg bg-neutral-700 text-neutral-400 text-center focus:outline-neutral-400"
            />
          </div>
          <div className="mb-10 w-full flex flex-col items-center">
            <label
              htmlFor="circuitIPFSHash"
              className="mb-2 font-bold text-neutral-400"
            >
              Circuit IPFS hash
            </label>
            <input
              type="text"
              id="circuitIPFSHash"
              defaultValue={circuitHash}
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
          {isRequestPending ? (
            <div className="flex items-center justify-center mt-8 text-center text-neutral-400 font-bold">
              <span className="pr-2">Request transaction pending</span>
              <div className="border-4 border-neutral-600 border-t-neutral-500 rounded-full w-4 h-4 animate-spin"></div>
            </div>
          ) : isRequestSuccess ? (
            <div className="text-neutral-400 font-bold mt-8 text-center">
              <span> Request successful ✅</span>
              <br/>
              {requestTransactionHash && (
                <a href={requestTransactionHash} className="underline">
                  {requestTransactionHash}
                </a>
              )}
            </div>
          ) : isRequestFailure ? (
            <div className="text-neutral-400 font-bold mt-8 text-center">
              <span> Request failure ❌</span>
              <br/>
              {requestTransactionHash && (
                <a href={requestTransactionHash} className="underline">
                  {requestTransactionHash}
                </a>
              )}
            </div>
          ) : null}
          {isProofPending ? (
            <div className="flex items-center justify-center mt-8 text-center text-neutral-400 font-bold">
              <span className="pr-2">Waiting for prover with valid proof</span>
              <div className="border-4 border-neutral-600 border-t-neutral-500 rounded-full w-4 h-4 animate-spin"></div>
            </div>
          ) : isProofSuccess ? (
            <div className="text-neutral-400 font-bold mt-8 text-center">
              <span> Proof successful ✅</span>
              <br/>
              {proofTransactionHash && (
                <a href={proofTransactionHash} className="underline">
                  {proofTransactionHash}
                </a>
              )}
            </div>
          ) : isProofFailure ? (
            <div className="text-neutral-400 font-bold mt-8 text-center">
              <span> Proof failure ❌</span>
              <br/>
              {proofTransactionHash && (
                <a href={proofTransactionHash} className="underline">
                  {proofTransactionHash}
                </a>
              )}
            </div>
          ) : null}
        </form>
      </main>
    </div>
  );
}
