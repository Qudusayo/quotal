import type { Metadata } from "next";
import { Karla } from "next/font/google";
import { headers } from "next/headers";
import { NextUIProvider } from "@nextui-org/react";
import { cookieToInitialState } from "wagmi";
import { config } from "@/config";
import Web3ModalProvider from "@/context";
import "./globals.css";
import { AppProvider } from "@/context/app-context";
import { Toaster } from "@/components/ui/toaster";

const karla = Karla({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Quotal",
  description: "Generate invoice quotes with ease",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialState = cookieToInitialState(config, headers().get("cookie"));

  return (
    <html lang="en">
      <body className={karla.className}>
        <Web3ModalProvider initialState={initialState}>
          <NextUIProvider>
            <AppProvider>{children}</AppProvider>
            <Toaster />
          </NextUIProvider>
        </Web3ModalProvider>
      </body>
    </html>
  );
}
