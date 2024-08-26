import type { Metadata } from "next";
import { headers } from "next/headers";
import { Inter } from "next/font/google";
import "./globals.css";

import { cookieToInitialState } from "wagmi";
import { Analytics } from "@vercel/analytics/react";
import { ZkRegexProvider } from "zk-regex-sdk";
import { config } from "./util/config";
import Web3ModalProvider from "./components/contexts/Web3ModalProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DeluluChat",
  description: "Proof of Luma by Strobe",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialState = cookieToInitialState(config, headers().get("cookie"));

  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>

      {/* VERCEL ANALYTICS */}
      <Analytics /> 

      <body className={inter.className}>
        <ZkRegexProvider
          clientId={process.env.NEXT_PUBLIC_ZKREGEX_CLIENT_ID!}
          zkRegexRegistryUrl={process.env.NEXT_PUBLIC_ZKREGEX_REGISTRY_URL!}
        >
          <Web3ModalProvider initialState={initialState}>
            {children}
          </Web3ModalProvider>
        </ZkRegexProvider>
      </body>
    </html>
  );
}
