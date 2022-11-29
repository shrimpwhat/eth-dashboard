import { ethers } from "hardhat";
import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { Contract, BigNumber } from "ethers";

describe("ERC20 staking", () => {
  const SECS_PER_YEAR = 365 * 24 * 60 * 60;
  const signer1Balance = ethers.utils.parseEther("10000");
  const signer2Balance = ethers.utils.parseEther("100");
  const rewardAmount = ethers.utils.parseEther("1000");

  const setup = async (duration = SECS_PER_YEAR) => {
    const [signer1, signer2] = await ethers.getSigners();
    const _token = await ethers.getContractFactory("Token");
    const token = await _token.deploy("MyToken", "MTKN", signer1Balance);
    await token.deployed();

    const _staking = await ethers.getContractFactory("StakingPool");
    const staking = await _staking.deploy(token.address, duration);
    await staking.deployed();

    await token.mintTo(signer2.address, signer2Balance);
    await token.approve(staking.address, ethers.constants.MaxUint256);
    await token
      .connect(signer2)
      .approve(staking.address, ethers.constants.MaxUint256);

    await staking.notifyRewardAmount(rewardAmount);
    return { token, staking, signer1, signer2 };
  };

  const setupFourYearDuration = async () => {
    return await setup(SECS_PER_YEAR * 4);
  };

  const getExpectedAPR = async (stakingContract: Contract) => {
    const rate = parseFloat(await stakingContract.rewardRate());
    const totalStaked = parseFloat(await stakingContract.totalSupply());
    return (rate * SECS_PER_YEAR) / totalStaked;
  };

  const getProfit = (amount: BigNumber, duration: number, apr: number) => {
    const depositAmount = parseFloat(amount.toString());
    return depositAmount * (1 + (apr * duration) / SECS_PER_YEAR);
  };

  it("Should stake some amount of tokens and withdraw it", async () => {
    const { staking, signer1, token } = await loadFixture(setup);
    const amount = ethers.utils.parseEther("100");
    await staking.stake(amount);
    expect(await staking.totalSupply()).eq(amount);
    expect(await staking.balanceOf(signer1.address)).eq(amount);
    expect(await token.balanceOf(signer1.address)).eq(
      signer1Balance.sub(amount).sub(rewardAmount)
    );
    await staking.withdraw(amount);
    expect(await staking.totalSupply()).eq(0);
    expect(await staking.balanceOf(signer1.address)).eq(0);
    expect(await token.balanceOf(signer1.address)).eq(
      signer1Balance.sub(rewardAmount)
    );
  });

  it("Should claims rewards", async () => {
    const { token, staking, signer2 } = await loadFixture(setup);
    const staking2 = staking.connect(signer2);
    const amount = signer2Balance;
    await staking2.stake(amount);
    await time.increase(3600);
    const earned = await staking2.earned(signer2.address);
    await staking2.getReward();
    expect(await token.balanceOf(signer2.address)).gt(
      signer2Balance.sub(amount).add(earned)
    );
  });

  it("Should exit staking pool", async () => {
    const { token, staking, signer2 } = await loadFixture(setup);
    const staking2 = staking.connect(signer2);
    await staking2.stake(ethers.utils.parseEther("100"));
    await time.increase(3600);
    const earned = await staking2.earned(signer2.address);
    await staking2.exit();
    expect(await token.balanceOf(signer2.address)).gte(
      signer2Balance.add(earned)
    );
  });

  it("Should get rewards according to calculated APR", async () => {
    const { token, staking, signer2 } = await loadFixture(setup);
    const duration = SECS_PER_YEAR / 4;
    const staking2 = staking.connect(signer2);
    const amount = signer2Balance;
    await staking2.stake(amount);
    const apr = await getExpectedAPR(staking);
    await time.increase(duration);
    await staking2.exit();
    const balance = parseFloat(
      (await token.balanceOf(signer2.address)).toString()
    );
    expect(balance).closeTo(getProfit(signer2Balance, duration, apr), 1e17);
  });

  it("Should get rewards according to calculated APR with different duration", async () => {
    const { token, staking, signer2 } = await loadFixture(
      setupFourYearDuration
    );
    const duration = SECS_PER_YEAR * 1.5;
    const staking2 = staking.connect(signer2);
    const amount = signer2Balance;
    await staking2.stake(amount);
    const apr = await getExpectedAPR(staking);
    await time.increase(duration);
    await staking2.exit();
    const balance = parseFloat(
      (await token.balanceOf(signer2.address)).toString()
    );
    expect(balance).closeTo(getProfit(signer2Balance, duration, apr), 1e17);
  });

  it("Should compound rewards", async () => {
    const { token, staking, signer1 } = await loadFixture(setup);
    await staking.stake(ethers.utils.parseEther("100"));
    await time.increase(3600);
    const balance = await token.balanceOf(signer1.address);
    const shares = await staking.balanceOf(signer1.address);
    await staking.compound();
    expect(balance).eq(await token.balanceOf(signer1.address));
    expect(shares).lt(await staking.balanceOf(signer1.address));
  });
});
