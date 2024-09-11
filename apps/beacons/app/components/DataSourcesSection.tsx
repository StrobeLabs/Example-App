import Image from "next/image";

export default function DataSourcesSection() {
  return (
    <>
      <div className="mt-8">
        <div className="text-md font-[400]">Top Data Sources</div>
        {["Chainlink", "Binance"].map((source) => (
          <div key={source} className="flex items-center gap-2 mt-4">
            <Image 
              src={source === "Chainlink" ? "/Chainlink-Logo-White.png" : "/Binance-Logo.png"} 
              alt={`${source} logo`} 
              width={56} 
              height={56} 
            />
            <div>
              <div className="text-xs opacity-60">Delivered a minute ago</div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-4 cursor-not-allowed opacity-60">
        <div className="text-xs opacity-60">+ Add new data source</div>
      </div>
    </>
  );
}