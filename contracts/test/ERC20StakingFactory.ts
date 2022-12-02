import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ContractTransaction } from "ethers";

describe("Staking factory", () => {
  const getFactory = async () => {
    const _factory = await ethers.getContractFactory("StakingPoolFactory");
    const factory = await _factory.deploy();
    await factory.deployed();

    const _token = await ethers.getContractFactory("Token");
    const token = await _token.deploy(
      "Test",
      "ABC",
      ethers.utils.parseEther("100")
    );
    await token.deployed();
    return { factory, token };
  };

  it("Should transfer ownership after creating a pool", async () => {
    const { factory, token } = await loadFixture(getFactory);
    const [signer] = await ethers.getSigners();
    const receipt = await factory
      .createPool(token.address, 365 * 86400)
      .then(async (tx: ContractTransaction) => {
        return await tx.wait();
      });
    const poolAddress = receipt?.events?.at(2)?.args?.poolAddress;
    const pool = await ethers.getContractAt("StakingPool", poolAddress);
    expect(await pool.owner()).eq(signer.address);
  });

  it("Should save pool after deploy", async () => {
    const { factory, token } = await loadFixture(getFactory);
    const [signer] = await ethers.getSigners();
    await factory
      .createPool(token.address, 365 * 86400)
      .then(async (tx: ContractTransaction) => await tx.wait());
    const pools = await factory.getUserPools(signer.address);
    expect(pools.length).eq(1);
    expect(await factory.tokenStakings(token.address)).eq(pools[0]);
  });
});
