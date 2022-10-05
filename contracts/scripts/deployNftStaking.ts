import { ethers } from "hardhat";

async function main() {
  const factory = await ethers.getContractFactory("NftStaking");
  const contract = await factory.deploy(
    "0x59089dCD64AaEBFBc7225b2d2D0443c2Cc2eA2e9",
    "0x97E6fdec337D653dc199bB6996fc9553090118De",
    100000000
  );
  await contract.deployed();
  console.log(contract.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

//0x533AE2a5672aEC0E2A42dA745BbB81D299C996Eb
