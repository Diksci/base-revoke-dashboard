import hre from "hardhat";

async function main() {
  const contract = await hre.ethers.deployContract("BaseGuardRevoke");
  await contract.waitForDeployment();
  const address = await contract.getAddress();
  console.log(`🚀 Berhasil! Kontrak Live di Base Mainnet: ${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});