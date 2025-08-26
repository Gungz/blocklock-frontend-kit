const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // Replace with actual Blocklock sender address for your network
  const blocklockSender = "0x82Fed730CbdeC5A2D8724F2e3b316a70A565e27e"; // Update this
  
  const MyBlocklockReceiver = await hre.ethers.getContractFactory("MyBlocklockReceiver");
  const contract = await MyBlocklockReceiver.deploy(blocklockSender);
  await contract.waitForDeployment();
  console.log("MyBlocklockReceiver deployed to:", await contract.getAddress());

  const BlocklockBirthdayGiftCard = await hre.ethers.getContractFactory("BlocklockBirthdayGiftCard");
  const giftCard = await BlocklockBirthdayGiftCard.deploy(blocklockSender);
  await giftCard.waitForDeployment();
  console.log("BlocklockBirthdayGiftCard deployed to:", await giftCard.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});