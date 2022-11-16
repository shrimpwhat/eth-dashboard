import hardhat, { ethers } from "hardhat";

const verify = async (address: string, constructorArguments: any[]) => {
  return hardhat.run("verify:verify", { address, constructorArguments });
};

async function main() {
  const Pool = await ethers.getContractFactory("RewardPool");
  const poolArgs = ["0x97E6fdec337D653dc199bB6996fc9553090118De"];
  const pool = await Pool.deploy(poolArgs[0]);
  await pool.deployed();

  const Vault = await ethers.getContractFactory("Vault");
  const Strategy = await ethers.getContractFactory("Strategy");

  const vaultArgs = ["xTest", "xABC"];
  const vault = await Vault.deploy(vaultArgs[0], vaultArgs[1]);
  await vault.deployed();

  const strategyArgs = [
    "0x97E6fdec337D653dc199bB6996fc9553090118De",
    pool.address,
    vault.address,
  ];
  const strategy = await Strategy.deploy(
    strategyArgs[0],
    strategyArgs[1],
    strategyArgs[2]
  );
  await strategy.deployed();

  await vault.setStrategy(strategy.address);

  console.log("Pool: " + pool.address);
  console.log("Vault: " + vault.address);
  console.log("Strategy: " + strategy.address);

  verify(pool.address, poolArgs);
  verify(vault.address, vaultArgs);
  verify(strategy.address, strategyArgs);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
