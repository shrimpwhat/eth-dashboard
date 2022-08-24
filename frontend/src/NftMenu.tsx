import Title from "./utils/components/Title";
import Input from "./utils/components/Input";
import ConnectButton from "./utils/components/ConnectButton";
import FindContract from "./utils/components/FindContract";
import CollectionFactory from "./utils/abi/factory.json";
import { useSigner, useContract, useAccount } from "wagmi";
import { FormEvent, useState } from "react";
import { errorAlert, deployedCollectionAlert } from "./utils/components/Popups";
import { ethers } from "ethers";

export default function NftMintPage() {
  const { address } = useAccount();
  const { data: signer } = useSigner();
  const [activeButton, setActiveButton] = useState(1);
  const contract: ethers.Contract = useContract({
    addressOrName: process.env.REACT_APP_NFT_FACTORY_ADDRESS ?? "",
    contractInterface: CollectionFactory.abi,
    signerOrProvider: signer,
  });

  const nonActive = "border rounded border-black p-3 ";
  const active = nonActive + "bg-purple-200";

  const getInputValue = (id: string) => {
    const input = document.getElementById(id) as HTMLInputElement;
    return input.value;
  };

  const createCollection = async () => {
    const data = getCollectionData();
    if (data.uri[data.uri.length - 1] !== "/") data.uri += "/";
    const tx: ethers.ContractTransaction = await contract.createCollection(
      data.name,
      data.symbol,
      data.limit,
      data.supply,
      data.price,
      data.uri
    );
    await tx.wait();
    console.log("Tx hash: " + tx.hash);
    return await contract.getLastCollection(address);
  };

  const getCollectionData = () => {
    const price = getInputValue("price");
    if (!isNaN(Number(price)))
      return {
        name: getInputValue("name"),
        symbol: getInputValue("symbol"),
        limit: getInputValue("limit"),
        supply: getInputValue("supply"),
        price: ethers.utils.parseUnits(price),
        uri: getInputValue("uri"),
      };
    else throw new Error("Wrong token price! Use . for float numbers");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (address) {
      deployedCollectionAlert(createCollection());
    } else errorAlert("Connect your wallet first!", "wallet-connect");
  };

  return (
    <div className="text-xl">
      <Title text="Create NFT" />
      <FindContract url="/nft/collection/" />
      <hr />
      <div className="mt-12 mb-8 flex justify-center gap-6 flex-wrap">
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
      <form onSubmit={handleSubmit}>
        <div className="flex gap-x-1 flex-wrap justify-between max-w-max mx-auto">
          <div>
            <Input text="Name" id="name" />
            <Input text="Symbol" id="symbol" />
            <Input text="Token price (in ETH)" id="price" />
          </div>
          <div>
            <Input text="User limit" id="limit" type="number" />
            <Input text="Max supply" id="supply" type="number" />
          </div>
          <div className="w-full flex flex-col justify-center">
            <label>Base metadata URI</label>
            <input
              className="border border-black p-1 mb-8 box-border"
              type="url"
              id="uri"
              required
            />
            <div className="mx-auto">
              {signer ? (
                <button
                  type="submit"
                  className={
                    nonActive + "duration-500 hover:bg-black hover:text-white"
                  }
                >
                  Submit
                </button>
              ) : (
                <ConnectButton />
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
