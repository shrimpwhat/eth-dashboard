import { ethers } from "hardhat";

async function main() {
  const factory = await ethers.getContractFactory("StakingPool");
  const contract = await factory.deploy(
    "0x7c7fD169b87d8872d3fA28255c3a1c8Ef5572645",
    31536000
  );
  await contract.deployed();
  console.log(contract.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
