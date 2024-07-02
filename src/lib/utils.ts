import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { checkAddress } from "@requestnetwork/shared";
import { getCurrenciesByNetwork } from "@requestnetwork/shared";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatAddress = (
  address: string,
  first: number = 6,
  last: number = 4
): string => {
  if (!checkAddress(address)) {
    console.error("Invalid address!");
  }

  return `${address.slice(0, first)}...${address.slice(-last)}`;
};

export const getSymbol = (network: string, value: string) => {
  const currenciesMap = getCurrenciesByNetwork(network);
  if (!currenciesMap) return "";
  return currenciesMap.get(`${checkNetwork(network)}_${value}`)?.symbol || "";
};

export const getDecimals = (network: string, value: string) => {
  const currenciesMap = getCurrenciesByNetwork(network);
  if (!currenciesMap) return 18;
  return currenciesMap.get(`${checkNetwork(network)}_${value}`)?.decimals || 18;
};

export const checkNetwork = (network: string) => {
  switch (network.toLowerCase()) {
    case "mainnet":
      return "1";
    case "matic":
      return "137";
    case "sepolia":
      return "11155111";
    default:
      return "1";
  }
};

export const checkStatus = (request: any) => {
  switch (request?.balance?.balance >= request?.expectedAmount) {
    case true:
      return "Paid";
    default:
      return "Created";
  }
};
