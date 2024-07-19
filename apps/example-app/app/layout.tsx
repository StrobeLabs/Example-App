import type { Metadata } from "next";
import { headers } from "next/headers";
import { Inter } from "next/font/google";
import "./globals.css";

import { cookieToInitialState } from "wagmi";

import { config } from "../config";
import Web3ModalProvider from "../context";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Example App",
  description: "Strobe Example App",
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
        <Web3ModalProvider initialState={initialState}>
          {children}
        </Web3ModalProvider>
      </body>
    </html>
  );
}
