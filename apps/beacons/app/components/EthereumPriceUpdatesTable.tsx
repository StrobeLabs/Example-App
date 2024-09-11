interface PriceUpdate {
  walletAddress: string;
  dataSource: string;
  feedPrice: string;
  timestamp: string;
  bounty: string;
}

const priceUpdates: PriceUpdate[] = [
  {
    walletAddress: "0x1234567567",
    dataSource: "Chainlink",
    feedPrice: "$2,300.01",
    timestamp: "09/11/2024 04:04:04 EST",
    bounty: "1,00,450.23",
  },
  {
    walletAddress: "0x1234567567",
    dataSource: "Chainlink",
    feedPrice: "$2,300.01",
    timestamp: "09/11/2024 04:04:04 EST",
    bounty: "1,00,450.23",
  },
];

const EthereumPriceUpdatesTable: React.FC = () => (
  <div className="bg-[black] text-white rounded-lg overflow-hidden w-[95%] mt-8">
    <div className="text-md font-[600] mb-4">List of Proof Submissions</div>
    <table className="w-full rounded-md overflow-hidden">
      <thead className="border-b border-gray-900">
        <tr className="bg-[#1F1F1F] text-sm">
          <th className="py-4 px-4 text-left font-[300]">Wallet Address</th>
          <th className="py-4 px-4 text-left font-[300]">Data Source</th>
          <th className="py-4 px-4 text-left font-[300]">Feed Price</th>
          <th className="py-4 px-4 text-left font-[300]">Timestamp</th>
          <th className="py-4 px-4 text-left font-[300]">Bounty</th>
        </tr>
      </thead>
      <tbody>
        {priceUpdates.map((update, index) => (
          <tr key={index} className="text-sm py-4">
            <td className="py-4 px-4 font-[300]">{update.walletAddress}</td>
            <td className="py-4 px-4 font-[300]">{update.dataSource}</td>
            <td className="py-4 px-4 font-[300]">{update.feedPrice}</td>
            <td className="py-4 px-4 font-[300]">{update.timestamp}</td>
            <td className="py-4 px-4 font-[300]">{update.bounty}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default EthereumPriceUpdatesTable;
