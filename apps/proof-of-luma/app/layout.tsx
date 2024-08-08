import type { Metadata } from "next";
import { headers } from "next/headers";
import { Inter } from "next/font/google";
import "./globals.css";

import { cookieToInitialState } from "wagmi";

import { config } from "../config";
import Web3ModalProvider from "../context";
import { ZkRegexProvider } from "zk-regex-sdk";

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
      <body className={inter.className}>
        <ZkRegexProvider
          clientId={
            "424623312719-73vn8vb4tmh8nht96q7vdbn3mc9pd63a.apps.googleusercontent.com"
          }
          zkRegexRegistryUrl="https://registry-dev.zkregex.com"
        >
          <Web3ModalProvider initialState={initialState}>
            {/* <div className="flex md:hidden p-12 text-center bg-black text-white items-center justify-center h-screen w-screen overflow-hidden">
              NOT SUPPORTED FOR MOBILE YET. PLEASE USE DESKTOP.
            </div> */}
            <div className="">{children}</div>
          </Web3ModalProvider>
        </ZkRegexProvider>
      </body>
    </html>
  );
}
