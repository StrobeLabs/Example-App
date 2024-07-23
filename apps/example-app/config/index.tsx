import { defaultWagmiConfig } from "@web3modal/wagmi/react/config";
import { http, cookieStorage, createStorage } from "wagmi";
import { sepolia } from "wagmi/chains";

export const projectId =
  process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "";

const metadata = {
  name: "Example App",
  description: "Strobe example app",
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
