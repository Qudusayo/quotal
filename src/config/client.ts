import { createWalletClient, custom } from "viem";
import { mainnet } from "viem/chains";

export const walletClient = createWalletClient({
  transport: custom((window as any).ethereum!),
});
