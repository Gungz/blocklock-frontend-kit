import { useQuery } from "@tanstack/react-query";
import { ethers } from "ethers";
import { useEthersProvider } from "@/hooks/useEthers";
import { useAccount } from "wagmi";
import { BIRTHDAY_CONTRACT_ABI, BIRTHDAY_CONTRACT_ADDRESS_BASE_SEPOLIA } from "@/lib/contract";

export const useBirthdayExplorer = () => {
  const provider = useEthersProvider();
  const { address } = useAccount();

  return useQuery({
    queryKey: ["birthdayGifts", address],
    queryFn: async () => {
      if (!provider || !address) return [];

      const contract = new ethers.Contract(
        BIRTHDAY_CONTRACT_ADDRESS_BASE_SEPOLIA,
        BIRTHDAY_CONTRACT_ABI,
        provider
      );

      const giftIds = await contract.getRecipientGiftCards(address);
      
      const gifts = await Promise.all(
        giftIds.map(async (id: bigint) => {
          const gift = await contract.giftCards(id);
          return {
            id: id.toString(),
            giftedBy: gift.giftedBy,
            recipient: gift.recipient,
            encryptedAt: gift.encryptedAt.toString(),
            decryptedAt: gift.decryptedAt.toString(),
            message: gift.message,
            claimed: gift.claimed,
          };
        })
      );

      return gifts;
    },
    enabled: !!provider && !!address,
  });
};