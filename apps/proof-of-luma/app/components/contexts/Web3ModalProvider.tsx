"use client";

import React, { ReactNode } from "react";
import { config, projectId } from "../../util/config";
import { createWeb3Modal } from "@web3modal/wagmi/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { State, WagmiProvider } from "wagmi";

// This component provides a Web3Modal context for the application.
// It sets up the necessary providers for Web3 interactions and React Query.
// The Web3Modal allows users to connect their wallets and interact with the blockchain.

const queryClient = new QueryClient();

createWeb3Modal({
  wagmiConfig: config,
  projectId,
});

export default function Web3ModalProvider({
  children,
  initialState,
}: {
  children: ReactNode;
  initialState?: State;
}) {
  return (
    <WagmiProvider config={config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
