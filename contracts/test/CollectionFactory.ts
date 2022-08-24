import hre from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";

describe("ERC721 Factory", () => {
  const getFactory = async () => {
    const _factory = await hre.ethers.getContractFactory("CollectionFactory");
    const factory = await _factory.deploy();
    await factory.deployed();
    return factory;
  };

  it("Should create a collection and mint a nft", async () => {
    const factory = await loadFixture(getFactory);
    const [signer] = await hre.ethers.getSigners();
    await factory.createCollection(
      "Any name",
      "TEST",
      2,
      6,
      "100000000000000",
      "ipfs://abcdefg"
    );
    const collectionAddress = await factory.getLastCollection(signer.address);
    expect(await factory.createdCollections(signer.address, 0)).eq(
      collectionAddress
    );
    expect(collectionAddress).is.not.undefined;
    const contract = await hre.ethers.getContractAt(
      "Collection",
      collectionAddress
    );
    expect(await contract.owner()).eq(signer.address);
    await contract.mint(1, { value: "100000000000000" });
    expect(await contract.balanceOf(signer.address)).eq(1);
  });
});
