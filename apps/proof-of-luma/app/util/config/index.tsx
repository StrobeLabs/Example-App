// This component configures the Web3Modal and Wagmi setup for the Proof of Luma application.
// It sets up the connection to the Sepolia testnet, defines metadata for the dApp,
// and configures storage and transport options for Web3 interactions.

import { defaultWagmiConfig } from "@web3modal/wagmi/react/config";
import { http, cookieStorage, createStorage } from "wagmi";
import { sepolia } from "wagmi/chains";

export const projectId =
  process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "";

const metadata = {
  name: "Proof of Luma",
  description: "Proof of Luma",
  url: "",
  icons: [""],
};

const chains = [sepolia] as const;
export const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
  transports: {
    [sepolia.id]: http(process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL),
  },
});
