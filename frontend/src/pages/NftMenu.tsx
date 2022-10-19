import Title from "../utils/components/Title";
import Input from "../utils/components/Input";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import FindContract from "../utils/components/FindContract";
import CollectionFactoryInterface from "../utils/abi/CollectionFactory.json";
import NftMinterInterface from "../utils/abi/NftMinter.json";
import { useSigner, useContract, useAccount } from "wagmi";
import { FormEvent, useState } from "react";
import {
  errorAlert,
  deployedCollectionAlert,
  nftMintAlert,
} from "../utils/components/Popups";
import { ethers } from "ethers";

const nonActive = "border rounded border-black p-3 ";
const active = nonActive + "bg-purple-200";

export default function NftMintPage() {
  const [activeButton, setActiveButton] = useState(1);

  return (
    <div className="text-xl">
      <Title text="Mint NFT" />
      <FindContract url="/nft/collection/" text={"Collection address"} />
      <div className="mb-8 flex justify-center gap-6 flex-wrap">
        <button
          className={activeButton === 1 ? active : nonActive}
          onClick={() => {
            setActiveButton(1);
          }}
        >
          Mint one nft
        </button>
        <button
          className={activeButton === 2 ? active : nonActive}
          onClick={() => {
            setActiveButton(2);
          }}
        >
          Create collection
        </button>
      </div>
      <div>{activeButton === 1 ? <MintSingleNft /> : <CreateCollection />}</div>
    </div>
  );
}

const CreateCollection = () => {
  const { isConnected } = useAccount();
  const { data: signer } = useSigner();
  const contract = useContract({
    addressOrName: process.env.REACT_APP_NFT_FACTORY_ADDRESS ?? "",
    contractInterface: CollectionFactoryInterface,
    signerOrProvider: signer,
  });

  const getInputValue = (id: string) => {
    const input = document.getElementById(id) as HTMLInputElement;
    return input.value;
  };

  const createCollection = async () => {
    const data = getCollectionData();
    if (data.uri[data.uri.length - 1] !== "/") data.uri += "/";
    const tx: ethers.ContractTransaction = await contract?.createCollection(
      data.name,
      data.symbol,
      data.limit,
      data.supply,
      data.price,
      data.uri
    );
    const txReceipt = await tx.wait();
    console.log("Tx hash:", txReceipt.transactionHash);
    if (txReceipt.events) return txReceipt.events[2].args?.collectionAddress;
    else throw new Error("No events have been emitted");
  };

  const getCollectionData = () => {
    const price = getInputValue("collection_price");
    if (!isNaN(Number(price)))
      return {
        name: getInputValue("collection_name"),
        symbol: getInputValue("collection_symbol"),
        limit: getInputValue("collection_limit"),
        supply: getInputValue("collection_supply"),
        price: ethers.utils.parseUnits(price),
        uri: getInputValue("collection_uri"),
      };
    else throw new Error("Wrong token price! Use . for float numbers");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isConnected) {
      deployedCollectionAlert(createCollection());
    } else errorAlert("Connect your wallet first!", "wallet-connect");
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex gap-x-1 flex-wrap justify-between max-w-max mx-auto">
        <div>
          <Input text="Name" id="collection_name" />
          <Input text="Symbol" id="collection_symbol" />
          <Input text="Token price (in ETH)" id="collection_price" />
        </div>
        <div>
          <Input text="User limit" id="collection_limit" type="number" />
          <Input text="Max supply" id="collection_supply" type="number" />
        </div>
        <div className="w-full flex flex-col justify-center">
          <label>Base metadata URI</label>
          <input
            className="border border-black p-1 mb-8 box-border"
            type="url"
            id="collection_uri"
            required
          />
          <div className="mx-auto">
            {isConnected ? (
              <button type="submit" className="submit-button">
                Create
              </button>
            ) : (
              <ConnectButton />
            )}
          </div>
        </div>
      </div>
    </form>
  );
};

const MintSingleNft = () => {
  const { isConnected } = useAccount();
  const { data: signer } = useSigner();
  const contract = useContract({
    addressOrName: process.env.REACT_APP_NFT_MINTER_ADDRESS ?? "",
    contractInterface: NftMinterInterface,
    signerOrProvider: signer,
  });

  const uploadImage = async (): Promise<string | undefined> => {
    const formData = new FormData();
    const image = (
      document.getElementById("nft_img") as HTMLInputElement
    ).files?.item(0);
    if (image) {
      formData.append("file", image);
      const response = await fetch(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        {
          method: "POST",
          body: formData,
          headers: {
            Authorization: `Bearer ${process.env.REACT_APP_PINATA_JWT_KEY}`,
          },
        }
      );
      const { IpfsHash } = await response.json();
      return IpfsHash;
    } else {
      throw new Error("No files added!");
    }
  };

  const uploadMetadata = async (imageHash: string): Promise<string> => {
    const name = (document.getElementById("nft_name") as HTMLInputElement)
      .value;
    const description = (
      document.getElementById("nft_description") as HTMLInputElement
    ).value;
    const data = JSON.stringify({
      pinataContent: {
        name,
        description,
        image: "ipfs://" + imageHash,
      },
    });
    const response = await fetch(
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      {
        method: "POST",
        body: data,
        headers: {
          Authorization: `Bearer ${process.env.REACT_APP_PINATA_JWT_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    const { IpfsHash } = await response.json();
    return IpfsHash;
  };

  const mint = async () => {
    const image = await uploadImage();
    if (image) {
      const metdata = await uploadMetadata(image);
      const tx = await contract.mint("ipfs://" + metdata);
      const receipt = await tx.wait();
      console.log("Tx hash:", receipt.transactionHash);
      return receipt;
    }
  };

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        nftMintAlert(mint());
      }}
    >
      <div className="max-w-max mx-auto">
        <Input text="Name" id="nft_name" className="w-full" />
        <Input text="Description" id="nft_description" className="w-full" />
        <Input text="Image" type="file" id="nft_img" />
        {isConnected ? (
          <div className="text-center">
            <button className="submit-button">Create</button>
          </div>
        ) : (
          <div className="flex">
            <div className="mx-auto">
              <ConnectButton />
            </div>
          </div>
        )}
      </div>
    </form>
  );
};
