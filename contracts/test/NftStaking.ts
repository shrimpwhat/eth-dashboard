import { ethers } from "hardhat";
import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { Contract, BigNumber } from "ethers";

describe("ERC721 staking", () => {
  const SECS_PER_YEAR = 365 * 24 * 60 * 60;
  const initSupply = ethers.utils.parseEther("100000");
  const rewardPool = ethers.utils.parseEther("50000");
  const rewardRate = ethers.utils.parseEther("5");

  const setup = async () => {
    const [signer] = await ethers.getSigners();
    const _token = await ethers.getContractFactory("Token");
    const token = await _token.deploy("Reward Token", "RWRD", initSupply);
    await token.deployed();

    const _collection = await ethers.getContractFactory("Collection");
    const collection = await _collection.deploy(
      "Staking collection",
      "NFT",
      100,
      10000,
      0,
      "ipfs://example"
    );
    await collection.deployed();

    const _staking = await ethers.getContractFactory("NftStaking");
    const staking = await _staking.deploy(
      collection.address,
      token.address,
      rewardRate
    );

    await token.transfer(staking.address, rewardPool);
    await collection.mint(5);
    await collection.setApprovalForAll(staking.address, true);

    return { token, staking, signer, collection };
  };

  it("Should stake nft and withdraw it", async () => {
    const { staking, signer, collection } = await loadFixture(setup);
    await staking.stake(0);
    expect((await staking.getStakedTokens(signer.address))[0].tokenId).eq(
      BigNumber.from(0)
    );
    expect(await collection.balanceOf(signer.address)).eq(4);
    await staking.withdraw(0);
    expect(await collection.balanceOf(signer.address)).eq(5);
  });

  it("Should claims rewards", async () => {
    const { token, staking, signer } = await loadFixture(setup);
    await staking.stake(0);
    await time.increase(86400);
    const rewards = await staking.availableRewards(signer.address);
    await staking.claimRewards();
    expect(await token.balanceOf(signer.address)).closeTo(
      ethers.utils.parseEther("50000").add(rewards),
      1e15
    );
  });

  it("Should exit staking pool", async () => {
    const { collection, staking, signer } = await loadFixture(setup);
    await staking.stake(0);
    await staking.stake(1);
    expect(await collection.balanceOf(signer.address)).eq(3);
    await staking.exit();
    expect(await collection.balanceOf(signer.address)).eq(5);
  });
});
