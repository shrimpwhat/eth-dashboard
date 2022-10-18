import { ethers } from "hardhat";

async function main() {
  const factory = await ethers.getContractFactory("TokenFactory");
  const contract = await factory.deploy();
  await contract.deployed();
  console.log(contract.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
