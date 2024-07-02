"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Web3SignatureProvider } from "@requestnetwork/web3-signature";
import type { RequestNetwork as iRequestNetwork } from "@requestnetwork/request-client.js";
import {
  RequestNetwork,
  Types,
  Utils,
} from "@requestnetwork/request-client.js";
import { walletClient } from "@/config/client";
import { useAccount, useWalletClient } from "wagmi";
import { IRequestDataWithEvents } from "@requestnetwork/request-client.js/dist/types";

interface iAppContext {
  address?: string;
  requestNetwork?: iRequestNetwork;
  getRequests: () => Promise<IRequestDataWithEvents[] | undefined>;
}

const defaultState: iAppContext = {
  address: undefined,
  requestNetwork: undefined,
  getRequests: () => Promise.resolve([]),
};

export const AppContext = createContext<iAppContext>(defaultState);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const account = useAccount();
  const [address, setAddress] = useState<string>();
  const [requestNetwork, setRequestNetwork] = useState<iRequestNetwork>();

  useEffect(() => {
    setAddress(account?.address || "");
  }, [account]);

  useEffect(() => {
    const init = async () => {
      try {
        const web3SignatureProvider = new Web3SignatureProvider(walletClient);

        const requestNetwork = new RequestNetwork({
          nodeConnectionConfig: {
            baseURL: "https://sepolia.gateway.request.network",
          },
          signatureProvider: web3SignatureProvider,
        });

        setRequestNetwork(requestNetwork);
      } catch (error) {
        console.error("Failed to initialize the Request Network:", error);
        setRequestNetwork(undefined);
      }
    };

    walletClient && init();
  }, [address, walletClient]);

  const getRequests = async () => {
    try {
      const web3SignatureProvider = new Web3SignatureProvider(walletClient);

      const requestNetwork = new RequestNetwork({
        nodeConnectionConfig: {
          baseURL: "https://sepolia.gateway.request.network",
        },
        signatureProvider: web3SignatureProvider,
      });

      if (!address || !requestNetwork) return Promise.resolve([]);

      const requestsData = await requestNetwork?.fromIdentity({
        type: Types.Identity.TYPE.ETHEREUM_ADDRESS,
        value: address,
      });
      const requests = requestsData
        ?.map((request) => request.getData())
        .sort((a, b) => b.timestamp - a.timestamp);

      return requests;
    } catch (error) {
      console.error("Failed to fetch requests:", error);
      return [];
    }
  };

  const appContextValue: iAppContext = {
    address,
    // requestNetwork,
    getRequests,
  };

  return (
    <AppContext.Provider value={appContextValue}>
      {children}
    </AppContext.Provider>
  );
};

export function useAppContext() {
  return useContext(AppContext);
}
