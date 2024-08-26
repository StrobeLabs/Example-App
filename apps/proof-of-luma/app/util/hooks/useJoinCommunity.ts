/**
 * useJoinCommunity Hook
 * 
 * This custom hook manages the process of joining a community in the Proof of Luma application.
 * It handles chain switching, contract interactions, and status updates throughout the joining process.
 * 
 * The hook provides functionality to:
 * - Check if a user is already whitelisted (joined)
 * - Handle the joining process, including proof submission
 * - Manage network switching to Sepolia if necessary
 * - Update status based on the outcome of the joining attempt
 * - Redirect to the chat page upon successful joining
 * 
 * @param address The Ethereum address of the user
 * @param status Current status of the joining process
 * @param setStatus Function to update the status
 * @param router Next.js router for navigation
 * 
 * @returns An object containing:
 *  - isWhitelisted: Boolean indicating if the user has already joined
 *  - isJoining: Boolean indicating if a join transaction is in progress
 *  - handleJoin: Function to initiate the joining process
 */

import { useCallback } from "react";
import { useReadContract, useWriteContract, useSwitchChain } from "wagmi";
import { useWeb3ModalState } from "@web3modal/wagmi/react";
import { sepolia } from "viem/chains";
import { ProofOfLumaRegistryABI } from "../../../abis/ProofOfLumaRegistry";

const PROOF_OF_LUMA_REGISTRY_ADDRESS = process.env
  .NEXT_PUBLIC_PROOF_OF_LUMA_REGISTRY_ADDRESS as `0x${string}`;

export function useJoinCommunity(address: string, status: string, setStatus: (status: string) => void, router: any) {
  const { selectedNetworkId } = useWeb3ModalState();
  const { switchChain } = useSwitchChain();

  const { data: isWhitelisted, refetch: refetchWhitelist } = useReadContract({
    address: PROOF_OF_LUMA_REGISTRY_ADDRESS,
    abi: ProofOfLumaRegistryABI,
    functionName: "isUserJoined",
    args: [address],
  });

  const { writeContractAsync: joinCommunity, isPending: isJoining } =
    useWriteContract();

  const handleJoin = useCallback(async (encodedProof: `0x${string}`, encodedPublicSignals: `0x${string}`) => {
    if (!encodedProof || !encodedPublicSignals) return;

    if (Number(selectedNetworkId) !== sepolia.id) {
      switchChain({ chainId: sepolia.id });
      return;
    }

    try {
      await joinCommunity({
        address: PROOF_OF_LUMA_REGISTRY_ADDRESS,
        abi: ProofOfLumaRegistryABI,
        functionName: "join",
        args: [encodedProof, encodedPublicSignals],
      });
      setStatus("joining");
      const { data: newWhitelistStatus } = await refetchWhitelist();
      if (newWhitelistStatus) {
        setStatus("whitelisted");
        router.push("/chat");
      }
    } catch (error) {
      console.error("Error joining community:", error);
      if (
        error instanceof Error &&
        (error.name === "ContractFunctionExecutionError" ||
          error.name === "ContractFunctionRevertedError")
      ) {
        setStatus("contract_error");
      } else if (error instanceof Error && error.message.includes("rejected")) {
        setStatus("transaction_rejected");
      } else {
        setStatus("error_with_proof");
      }
    }
  }, [selectedNetworkId, switchChain, joinCommunity, refetchWhitelist, router, setStatus]);

  return { isWhitelisted, isJoining, handleJoin };
}