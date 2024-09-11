interface UpdateRewardSectionProps {
    onUpdateClick: () => void;
  }
  
  export default function UpdateRewardSection({ onUpdateClick }: UpdateRewardSectionProps) {
    return (
      <>
        <div className="flex items-center gap-2">
          <div className="text-xl font-medium">Answer Update Reward</div>
          <div className="bg-[#11b4d8cc] text-base">0.005 ETH</div>
        </div>
        <div className="text-sm opacity-60 font-[200] mt-4">
          We provide a bounty for anyone who can update the answer every 30
          mins. Update by submitting a JSON file from a{" "}
          <a href="/" className="underline">
            local proof generated
          </a>{" "}
          from an email containing the price.
        </div>
        <div className="mt-8">
          <button
            onClick={onUpdateClick}
            className="bg-[#11b4d8] text-white px-4 py-3 rounded-md w-full font-[500] hover:bg-[#11b4d8cc] transition-all duration-300"
          >
            Update
          </button>
        </div>
      </>
    );
  }