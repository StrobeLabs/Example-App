"use client";

import { useWalletInfo, useWeb3Modal, useWeb3ModalState } from '@web3modal/wagmi/react';
import { useState, ChangeEvent, useEffect, useCallback } from "react";
import { useReadContract, useSwitchChain, useAccount } from "wagmi";
import { useZkRegex } from "zk-regex-sdk";
import { encodeAbiParameters } from 'viem';
import PostalMime from 'postal-mime';
import { sepolia } from 'viem/chains';
import axios from 'axios';
import { ProofTypeZKEmailABI } from '../../abis/ProofTypeZKEmail';

const PROOF_OF_LUMA_ADDRESS = process.env.NEXT_PUBLIC_PROOF_OF_LUMA_ADDRESS as `0x${string}`;

export default function Home() {
  const { walletInfo } = useWalletInfo();
  const account = useAccount();
  const { open } = useWeb3Modal();
  const { selectedNetworkId } = useWeb3ModalState();
  const { switchChain } = useSwitchChain();
  const { createInputWorker, generateInputFromEmail } = useZkRegex();

  const [status, setStatus] = useState('idle');
  const [jobId, setJobId] = useState<string | null>(null);
  const [proof, setProof] = useState<any | null>(null);
  const [encodedProof, setEncodedProof] = useState<`0x${string}` | null>(null);
  const [encodedPublicSignals, setEncodedPublicSignals] = useState<`0x${string}` | null>(null);

  const { data: verificationResult, error: verificationError, isLoading: isVerifying, refetch } = useReadContract({
    address: PROOF_OF_LUMA_ADDRESS,
    abi: ProofTypeZKEmailABI,
    functionName: 'verify',
    args: encodedProof && encodedPublicSignals ? [encodedProof, encodedPublicSignals] : ['0x','0x'],
  });

//   if(encodedProof && encodedPublicSignals) {
//     console.log(encodedProof)
//     console.log(encodedPublicSignals)
//   }

  useEffect(() => {
    createInputWorker('testing/luma');
  }, []);

  useEffect(() => {
    if (isVerifying) {
      setStatus('verifying');
    } else if (verificationResult !== undefined) {
      setStatus('verified');
    } else if (verificationError) {
      setStatus('error');
      console.error('Verification error:', verificationError);
    }
  }, [isVerifying, verificationResult, verificationError]);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setStatus('processing');
    const reader = new FileReader();
    reader.onload = async (e) => {
      const contents = e.target?.result;
      if (typeof contents !== "string") return;

      try {
        const parsed = await PostalMime.parse(contents);
        const inputs = await generateInputFromEmail('testing/luma', contents);
        
        const response = await axios.post('https://registry-dev.zkregex.com/api/proof/testing/luma', inputs);
        if (response.data.id) {
          setJobId(response.data.id);
          setStatus('polling');
          pollJobStatus(response.data.id);
        }
      } catch (error) {
        console.error('Error processing email:', error);
        setStatus('error');
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
        const response = await axios.get(`https://registry-dev.zkregex.com/api/job/${id}`);
        console.log('Job status:', response.data.status);

        // const response = {
        //     data: {
        //         "id": "clzf015lo000r9d34zrigb7et",
        //         "pollUrl": "/api/job/clzf015lo000r9d34zrigb7et",
        //         "status": "COMPLETED",
        //         "publicOutput": [
        //             "9283862132906206173231503844388353637958035881803629232600094123534923017779",
        //             "11524861921609704033742061508122713605071039312553788599207905682035",
        //             "0",
        //             "0",
        //             "205730529291895442492427822992419079830664464590237701454167029857395369298",
        //             "111490392858735",
        //             "0"
        //         ],
        //         "proof": {
        //             "pi_a": [
        //                 "17616190906092919488872606965719332050166120791737966971781550097280607029561",
        //                 "12061377783383662326624953597095032552311100548532729888467312345329819376338",
        //                 "1"
        //             ],
        //             "pi_b": [
        //                 [
        //                     "16954475292205907536335435465812900408440417054094819692627723076006620885572",
        //                     "12471468468032087058184828908486773032659859892715582668806761354225735117924"
        //                 ],
        //                 [
        //                     "11157890399144030094259754303854924814104317217257745441914595471727786284329",
        //                     "4700285780101052121935955055846495321949352786712249905439048426516614463762"
        //                 ],
        //                 [
        //                     "1",
        //                     "0"
        //                 ]
        //             ],
        //             "pi_c": [
        //                 "17902288821430891800709424370502744746901482877420693487026156336142149220192",
        //                 "9463065135161127120259868138136509766400847597250253860916748798758688772940",
        //                 "1"
        //             ],
        //             "protocol": "groth16",
        //             "curve": "bn128"
        //         },
        //         "estimatedTimeLeft": 0
        //     }
        // }

        if (response.data.status === 'COMPLETED') {
          setProof(response.data.proof);
          encodeProof(response.data.proof, response.data.publicOutput);
          setStatus('proof_ready');
          return;
        }

        if (response.data.status === 'FAILED') {
          console.error('Job failed:', response.data.error);
          setStatus('error');
          return;
        }

        attempts++;
        if (attempts >= maxAttempts) {
          console.error('Max polling attempts reached. Job did not complete in time.');
          setStatus('error');
          return;
        }

        setTimeout(poll, pollInterval);
      } catch (error) {
        console.error('Error polling job status:', error);
        setStatus('error');
      }
    };

    poll();
  };

  const encodeProof = useCallback((proofData: any, publicOutput: string[]) => {
    const { pi_a, pi_b, pi_c } = proofData;

    const pi_a_bigint = pi_a.slice(0, -1).map(BigInt);
    const pi_b_bigint = [[BigInt(pi_b[0][1]), BigInt(pi_b[0][0])], [BigInt(pi_b[1][1]), BigInt(pi_b[1][0])]];
    const pi_c_bigint = pi_c.slice(0, -1).map(BigInt);
    const publicSignals_bigint = publicOutput.map(BigInt);

    const encodedProof = encodeAbiParameters(
      [{ type: 'uint256[2]' }, { type: 'uint256[2][2]' }, { type: 'uint256[2]' }],
      [pi_a_bigint, pi_b_bigint, pi_c_bigint]
    );

    const encodedPublicSignals = encodeAbiParameters(
      [{ type: 'uint256[]' }],
      [publicSignals_bigint]
    );

    setEncodedProof(encodedProof);
    setEncodedPublicSignals(encodedPublicSignals);
  }, []);

  const verifyProof = async () => {
    if (!encodedProof || !encodedPublicSignals) return;
    await refetch();
  };

  const renderStatus = () => {
    switch (status) {
      case 'idle':
        return 'Upload an email to start the verification process.';
      case 'processing':
        return 'Processing email...';
      case 'polling':
        return 'Generating proof...';
      case 'proof_ready':
        return 'Proof generated. Ready for verification.';
      case 'verifying':
        return 'Verifying proof on-chain...';
      case 'verified':
        return `Verification result: ${verificationResult ? 'Success' : 'Failed'}`;
      case 'error':
        return 'An error occurred. Please try again.';
      default:
        return '';
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
            onChange={handleFileChange}
            disabled={status !== 'idle' && status !== 'error'}
          />
        </label>
    
        <button
          type="button"
          className="flex justify-center items-center p-4 mt-4 bg-neutral-400 text-neutral-800 rounded-full font-bold transition duration-300 hover:bg-neutral-700 hover:text-neutral-500"
          onClick={verifyProof}
          disabled={status !== 'proof_ready'}
        >
          Verify Proof On-Chain
        </button>

        <div className="mt-4 text-neutral-400">
          {renderStatus()}
        </div>
      </div>
    </div>
  );
}