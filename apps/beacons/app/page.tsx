"use client";

import { useState } from "react";
import EthereumPriceUpdatesTable from "./components/EthereumPriceUpdatesTable";
import Header from "./components/Header";
import PriceChart from "./components/PriceChart";
import UpdateRewardSection from "./components/UpdateRewardSection";
import DataSourcesSection from "./components/DataSourcesSection";
import UpdateModal from "./components/UpdateModal";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("1H");

  return (
    <div className="relative w-screen h-screen">
      <Header />
      <div className="absolute top-0 left-0 w-screen h-screen p-36 py-28 text-white">
        <div>
          <span className="opacity-60">Price Feeds &gt;</span>{" "}
          <span className="">Ethereum Latest Price Beacon</span>
        </div>
        <div className="text-2xl font-medium mt-8">Ethereum</div>
        <div className="text-sm tracking-tight">
          <span className="opacity-60">Last updated about</span>{" "}
          <span className="text-[#11B4D8]">2 min ago</span>
        </div>

        <div className="flex items-center justify-between">
          {/* left side */}
          <div className="w-3/4 h-1">
            <PriceChart
              selectedPeriod={selectedPeriod}
              setSelectedPeriod={setSelectedPeriod}
            />
            <EthereumPriceUpdatesTable />
          </div>
          {/* right side */}
          <div className="w-[35%] h-1">
            <UpdateRewardSection onUpdateClick={() => setIsModalOpen(true)} />
            <DataSourcesSection />
          </div>
        </div>
      </div>
      <UpdateModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
