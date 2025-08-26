import { ethers, getBytes } from "ethers";
import { Blocklock, encodeCiphertextToSolidity, encodeCondition } from "blocklock-js";
import { useMutation } from "@tanstack/react-query";
import { useEthersProvider, useEthersSigner } from "@/hooks/useEthers";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { BIRTHDAY_CONTRACT_ABI, BIRTHDAY_CONTRACT_ADDRESS_BASE_SEPOLIA, BLOCKLOCK_CONTRACT_ABI } from "@/lib/contract";
import { useNetworkConfig } from "./useNetworkConfig";

export const useBirthdayGift = () => {
  const [activeTab, setActiveTab] = useState("create");
  const [message, setMessage] = useState("");
  const [birthdayDate, setBirthdayDate] = useState("");
  const [recipient, setRecipient] = useState("");
  const signer = useEthersSigner();
  const provider = useEthersProvider();
  const { chainId, address } = useAccount();
  const { secondsPerBlock, gasConfig } = useNetworkConfig();

  const dateToBlockHeight = async (targetDate: string) => {
    if (!provider || !secondsPerBlock) throw new Error("Provider not available");
    
    const currentBlock = await provider.getBlockNumber();
    const currentBlockData = await provider.getBlock(currentBlock);
    const currentTimestamp = currentBlockData?.timestamp || Math.floor(Date.now() / 1000);
    console.log("Current Block:", currentBlock, "Timestamp:", currentTimestamp);
    
    const targetTimestamp = Math.floor(new Date(targetDate).getTime() / 1000);
    console.log("Target Timestamp:", targetTimestamp);
    const timeDiff = targetTimestamp - currentTimestamp;
    
    if (timeDiff <= 0) throw new Error("Birthday date must be in the future");
    
    const blocksToAdd = Math.ceil(timeDiff / secondsPerBlock);
    console.log("Seconds per block:", secondsPerBlock);
    console.log("Blocks to add:", blocksToAdd);
    return currentBlock + blocksToAdd;
  };

  const createGift = useMutation({
    mutationFn: async ({ message, birthdayDate, recipient }: { message: string; birthdayDate: string; recipient: string }) => {
      if (!signer || !provider || !chainId) throw new Error("Please connect your wallet");
      if (!ethers.isAddress(recipient)) throw new Error("Invalid recipient address");

      const contract = new ethers.Contract(BIRTHDAY_CONTRACT_ADDRESS_BASE_SEPOLIA, BIRTHDAY_CONTRACT_ABI, signer);
      
      const currentBlock = await provider.getBlockNumber();
      const targetBlock = await dateToBlockHeight(birthdayDate);
      
      const msgBytes = ethers.AbiCoder.defaultAbiCoder().encode(["string"], [message]);
      const encodedMessage = getBytes(msgBytes);
      
      const blocklockjs = Blocklock.createFromChainId(signer, chainId);
      const cipherMessage = blocklockjs.encrypt(encodedMessage, BigInt(targetBlock));
      console.log("Ciphertext:", cipherMessage);
      
      const callbackGasLimit = gasConfig.callbackGasLimitDefault;
      const conditionBytes = encodeCondition(BigInt(targetBlock));

      const feeData = await provider.getFeeData();
      
      if (!feeData.maxFeePerGas) {
        throw new Error("No fee data found");
      }

      const blocklockContract = new ethers.Contract(
        gasConfig.blocklockAddress,
        BLOCKLOCK_CONTRACT_ABI,
        signer
      );
      
      const requestPrice = (await blocklockContract.estimateRequestPriceNative(
        callbackGasLimit,
        feeData.maxFeePerGas
      )) as bigint;
      
      const requestCallBackPrice =
        requestPrice +
        (requestPrice * BigInt(gasConfig.gasBufferPercent)) / BigInt(100);
      
      console.log(
        "Request CallBack price:",
        ethers.formatEther(requestCallBackPrice),
        "ETH"
      );
      
      const tx = await contract.createBirthdayGift(
        recipient,
        callbackGasLimit,
        currentBlock,
        targetBlock,
        conditionBytes,
        encodeCiphertextToSolidity(cipherMessage),
        { value: requestCallBackPrice }
      );
      
      await tx.wait(2);
      setMessage("");
      setBirthdayDate("");
      setRecipient("");
      setActiveTab("explorer");
    },
  });

  return {
    activeTab,
    setActiveTab,
    message,
    setMessage,
    birthdayDate,
    setBirthdayDate,
    recipient,
    setRecipient,
    createGift,
    userAddress: address,
  };
};