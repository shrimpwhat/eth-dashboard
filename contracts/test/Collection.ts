import hre from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";

describe("Erc721 Mint", () => {
  const tokenPrice = hre.ethers.utils.parseUnits("0.01");

  const getContract = async () => {
    const contractFactory = await hre.ethers.getContractFactory("Collection");
    const contract = await contractFactory.deploy(
      "Any name",
      "TEST",
      2,
      6,
      tokenPrice,
      "ipfs://abcdefg"
    );
    await contract.deployed();
    return contract;
  };

  it("Should mint one token", async () => {
    const contract = await loadFixture(getContract);
    await contract.mint(1, { value: tokenPrice });
    expect(await contract.totalMinted()).eq(1);
  });

  it("Should be reverted when sending no ETH", async () => {
    const contract = await loadFixture(getContract);
    await expect(contract.mint(1)).to.be.reverted;
  });

  it("Should be reverted if user exceeded the limit", async () => {
    const contract = await loadFixture(getContract);
    await expect(contract.mint(3, { value: tokenPrice })).to.be.reverted;
  });

  it("Should be reverted if trying to mint more than max supply", async () => {
    const contract = await loadFixture(getContract);
    const signers = await hre.ethers.getSigners();
    let i = 0;
    for (i; i < 3; ++i)
      await contract.connect(signers[i]).mint(2, { value: tokenPrice.mul(2) });
    expect(await contract.totalMinted()).eq(6);
    await expect(contract.connect(signers[i]).mint(1, { value: tokenPrice })).to
      .be.reverted;
  });
});
