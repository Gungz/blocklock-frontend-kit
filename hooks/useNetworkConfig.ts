import {
  CHAIN_ID_BLOCK_TIME,
  CHAIN_ID_GAS_CONFIG,
  CHAIN_ID_TO_ADDRESS,
} from "@/lib/contract";
import { useAccount } from "wagmi";

export const useNetworkConfig = () => {
  const { chainId } = useAccount();
  const availableChains = Object.keys(CHAIN_ID_TO_ADDRESS);

  if (!chainId || !availableChains.includes(chainId.toString())) {
    console.warn("Chain not supported");
  }

  return {
    CONTRACT_ADDRESS:
      CHAIN_ID_TO_ADDRESS[
        chainId?.toString() as keyof typeof CHAIN_ID_TO_ADDRESS
      ],
    secondsPerBlock:
      CHAIN_ID_BLOCK_TIME[
        chainId?.toString() as keyof typeof CHAIN_ID_BLOCK_TIME
      ],
    gasConfig:
      CHAIN_ID_GAS_CONFIG[
        chainId?.toString() as keyof typeof CHAIN_ID_GAS_CONFIG
      ],
    BIRTHDAY_CONTRACT_ADDRESS: "0x2957642D8898225115b79e0bDEc0120AD2e03679",
  };
};
