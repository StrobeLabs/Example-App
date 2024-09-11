interface UpdateModalProps {
    isOpen: boolean;
    onClose: () => void;
  }
  
  export default function UpdateModal({ isOpen, onClose }: UpdateModalProps) {
    if (!isOpen) return null;
  
    return (
      <div 
        className="fixed inset-0 flex items-center justify-center z-50"
        style={{ backdropFilter: 'blur(5px)' }}
        onClick={onClose}
      >
        <div 
          className="bg-[#1F1F1F] p-8 rounded-lg w-96"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-xl font-bold mb-4 text-white">Answer Update Submission</h2>
          <p className="text-sm text-gray-300 mb-6 font-[300] opacity-60">
            We provide a bounty for anyone who can update the answer every 30 mins. Update by submitting a JSON file from a local proof generated from an email containing the price.
          </p>
          <div className="mb-6">
            <p className="text-2xl font-semibold text-white">0.005 ETH</p>
            <p className="text-sm text-gray-400 font-[300] opacity-60">Bounty Reward</p>
          </div>
          <div className="mb-6">
            <select className="w-full bg-[#2C2C2C] text-white p-3 rounded-md no-caret focus:outline-none">
              <option>Coinbase</option>
              <option>Binance</option>
              {/* Add other options here */}
            </select>
            <p className="text-sm text-gray-400 mt-1 font-[300] opacity-60">Data Source</p>
          </div>
          <button
            onClick={onClose}
            className="w-full bg-[#11b4d8] text-white py-3 rounded-md hover:bg-[#11b4d8cc] transition-all duration-300"
          >
            Submit
          </button>
        </div>
      </div>
    );
  }