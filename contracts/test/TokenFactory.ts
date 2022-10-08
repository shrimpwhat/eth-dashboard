import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";

describe("ERC20 Factory", () => {
  const initAmount = 10000000000,
    additionalAmount = 50000;

  const getToken = async () => {
    const [signer] = await ethers.getSigners();
    const _factory = await ethers.getContractFactory("TokenFactory");
    const factory = await _factory.deploy();
    await factory.deployed();
    const tx = await factory.createToken("Test token", "TEST", initAmount);
    const receipt = await tx.wait();
    const tokenAddress = receipt?.events?.at(3)?.args?.tokenAddress;
    expect((await factory.getUserTokens(signer.address))[0]).eq(tokenAddress);
    const tokenContract = await ethers.getContractAt("Token", tokenAddress);
    expect(await tokenContract.owner()).eq(signer.address);
    return { contract: tokenContract, signer: signer.address };
  };

  it("Should have minted tokens after deploying", async () => {
    const { contract, signer } = await loadFixture(getToken);
    expect(await contract.balanceOf(signer)).eq(initAmount);
  });

  it("Should have mint more tokens", async () => {
    const { contract, signer } = await loadFixture(getToken);
    const tx = await contract.mint(additionalAmount);
    await tx.wait();
    expect(await contract.balanceOf(signer)).eq(initAmount + additionalAmount);
  });

  it("Should burn all tokens", async () => {
    const { contract, signer } = await loadFixture(getToken);
    const tx = await contract.burn(initAmount);
    await tx.wait();
    expect(await contract.balanceOf(signer)).eq(0);
  });
});
