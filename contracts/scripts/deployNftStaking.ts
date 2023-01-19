import { ethers } from "hardhat";

async function main() {
  const factory = await ethers.getContractFactory("NftStaking");
  const contract = await factory.deploy(
    "0x22B2baaBaDC6bdC96d3Af5154638bbbAe5dCBfCc",
    "0xB052f285b901086997Bdde9CB15F87814Cc5744E",
    1
  );
  await contract.deployed();
  console.log(contract.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
