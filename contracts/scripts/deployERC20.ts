import { ethers } from "hardhat";

async function main() {
  const factory = await ethers.getContractFactory("Token");
  const contract = await factory.deploy("Test", "ABC", 1000);
  await contract.deployed();
  console.log(contract.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
