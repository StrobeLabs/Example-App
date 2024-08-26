import Image from "next/image";
import { useProofGeneration } from "../../../../util/hooks/useProofGeneration";
import StatusDisplay, { Status } from "./StatusDisplay";
import ProofMethodSelector from "./ProofMethodSelector";
import RemoteProofUploader from "./RemoteProofUploader";
import LocalProofUploader from "./LocalProofUploader";
import JoinCommunityButton from "./JoinCommunityButton";

export interface NotWhitelistedViewProps {
  estimatedTimeLeft?: number;
  isConnected: boolean;
  isWhitelisted: boolean;
  status: string;
  proofMethod: "remote" | "local" | null;
  handleProofMethodChange: (method: "remote" | "local" | null) => void;
  handleRemoteProof: (
    event: React.ChangeEvent<HTMLInputElement>
  ) => Promise<void>;
  handleLocalProof: (
    event: React.ChangeEvent<HTMLInputElement>,
    fileType: "proof" | "publicOutput"
  ) => void;
  selectedProofFileName: string | null;
  selectedPublicOutputFileName: string | null;
  file: File | null;
  proofFile: File | null;
  publicOutputFile: File | null;
  handleJoin: (
    encodedProof: `0x${string}`,
    encodedPublicSignals: `0x${string}`
  ) => Promise<void>;
  isJoining: boolean;
}

const NotWhitelistedView = ({
  estimatedTimeLeft,
  isConnected,
  isWhitelisted,
  status,
  proofMethod,
  handleProofMethodChange,
  handleRemoteProof,
  handleLocalProof,
  selectedProofFileName,
  selectedPublicOutputFileName,
  file,
  proofFile,
  publicOutputFile,
  handleJoin,
  isJoining,
}: NotWhitelistedViewProps) => {
  const { encodedProof, encodedPublicSignals } = useProofGeneration();

  return (
    <div className="flex-col flex gap-6 bg-black justify-center items-center min-h-screen duration-1000 transition-all absolute top-0 left-0 w-screen px-4 md:px-0">
      <Image
        src={"/ascii-art.png"}
        width={400}
        height={400}
        className="invert"
        alt="art"
      />

      {!isConnected ? (
        <w3m-button />
      ) : (
        <div className="text-neutral-400 text-center">
          {isWhitelisted
            ? "Welcome to the community!"
            : "Connected! Please proceed with proof generation."}
        </div>
      )}

      <StatusDisplay status={status as Status} estimatedTimeLeft={estimatedTimeLeft} />

      {/* This section handles the user interface for proof generation and joining the community.
         It conditionally renders different components based on the current status and proof method.
         The ProofMethodSelector allows users to choose between remote and local proof generation.
         RemoteProofUploader and LocalProofUploader components are rendered based on the selected method.
         The JoinCommunityButton is always rendered, but its functionality depends on the current state. */}
      {!["joining", "proof_ready", "processing", "polling"].includes(
        status
      ) && (
        <>
          <ProofMethodSelector
            proofMethod={proofMethod}
            onMethodChange={handleProofMethodChange}
          />

          {proofMethod === "remote" && (
            <RemoteProofUploader
              handleRemoteProof={handleRemoteProof}
              status={status}
            />
          )}

          {proofMethod === "local" && (
            <LocalProofUploader
              handleLocalProof={(event, fileType) =>
                handleLocalProof(event, fileType)
              }
              selectedProofFileName={selectedProofFileName}
              selectedPublicOutputFileName={selectedPublicOutputFileName}
              status={status}
            />
          )}
        </>
      )}

      <JoinCommunityButton
        proofMethod={proofMethod}
        file={file}
        proofFile={proofFile}
        publicOutputFile={publicOutputFile}
        status={status}
        handleJoin={() => handleJoin(encodedProof!, encodedPublicSignals!)}
        isJoining={isJoining}
      />

      <div className="text-[magenta] mt-14 text-md">
        Powered by zkEmail and Strobe
      </div>
    </div>
  );
};
export default NotWhitelistedView;
