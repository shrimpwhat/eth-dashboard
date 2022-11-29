import hre from "hardhat";
import { expect } from "chai";

describe("Nft Minter", () => {
  it("Should mint few nfts", async () => {
    const [signer] = await hre.ethers.getSigners();
    const factory = await hre.ethers.getContractFactory("NftMinter");
    const contract = await factory.deploy();
    await contract.deployed();
    const uri_1 = "ipfs://example1";
    const uri_2 = "ipfs://example2";
    await contract.mint(uri_1);
    expect(await contract.tokenURI(0)).eq(uri_1);
    expect(await contract.balanceOf(signer.address)).eq(1);
    await contract.mint(uri_2);
    expect(await contract.tokenURI(1)).eq(uri_2);
    expect(await contract.balanceOf(signer.address)).eq(2);
  });
});
