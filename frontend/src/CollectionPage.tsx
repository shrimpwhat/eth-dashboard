import { useParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useContract, useSigner, useAccount } from "wagmi";
import Title from "./utils/components/Title";
import Collection from "./utils/abi/collection.json";
import ConnectButton from "./utils/components/ConnectButton";
import { TransactionAlert } from "./utils/components/Popups";
import { ethers, BigNumber } from "ethers";

interface CollectionInfo {
  name: string;
  price: BigNumber;
  userLimit: number;
  maxSupply: number;
  totalMinted: number;
  userMintedAmount: number;
}

export default function CollectionPage() {
  const { address } = useAccount();
  const { address: contractAddress } = useParams();
  const { data: signer } = useSigner();
  const contract: ethers.Contract = useContract({
    addressOrName: contractAddress as string,
    contractInterface: Collection.abi,
    signerOrProvider: signer,
  });
  const mintAmount = useRef(1);

  const [collectionInfo, updateInfo]: [CollectionInfo, Function] = useState({
    name: "",
    price: BigNumber.from(0),
    userLimit: 0,
    maxSupply: 0,
    totalMinted: 0,
    userMintedAmount: 0,
  });
  const [isFetched, setFetchStatus] = useState(false);

  useEffect(() => {
    (async () => {
      if (contract && signer) {
        const name = await contract.name();
        const price = await contract.TOKEN_PRICE();
        const userLimit = Number(await contract.MAX_USER_LIMIT());
        const totalMinted = Number(await contract.totalMinted());
        const maxSupply = Number(await contract.MAX_SUPPLY());
        const userMintedAmount = Number(await contract.numberMinted(address));
        updateInfo({
          name,
          price,
          userLimit,
          totalMinted,
          maxSupply,
          userMintedAmount,
        });
        setFetchStatus(true);
      }
    })();
  }, [signer, contract]);

  const updateInfoAfterMint = async () => {
    const totalMinted = Number(await contract.totalMinted());
    const userMintedAmount = Number(await contract.numberMinted(address));
    updateInfo({
      ...collectionInfo,
      totalMinted,
      userMintedAmount,
    });
  };

  const mint = async () => {
    const tx = await contract.mint(mintAmount.current, {
      value: collectionInfo.price.mul(mintAmount.current).toString(),
    });
    const receipt = await tx.wait();
    console.log(receipt.transactionHash);
    updateInfoAfterMint();
    return receipt;
  };

  return (
    <div>
      <Title text="Nft minting page" />
      {isFetched ? (
        <div className="mx-auto md:w-[500px] lg:w-[700px] border border-black text-center p-2 mt-8">
          <h2 className="text-3xl mt-3">{collectionInfo.name}</h2>
          <p className="mt-4 text-xl">
            {collectionInfo.maxSupply - collectionInfo.totalMinted}/
            {collectionInfo.maxSupply} Available
          </p>

          <div className="text-center">
            {collectionInfo.userMintedAmount < collectionInfo.userLimit ? (
              <>
                <p className="mt-4 text-xl">
                  You can mint{" "}
                  {collectionInfo.userLimit - collectionInfo.userMintedAmount}{" "}
                  more nfts
                </p>
                <form
                  className="mt-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    TransactionAlert(mint());
                  }}
                >
                  <label htmlFor="mint-amount" className="mr-3 text-xl">
                    Amount to mint
                  </label>
                  <input
                    type="number"
                    id="mint-amount"
                    max={
                      collectionInfo.userLimit - collectionInfo.userMintedAmount
                    }
                    min="1"
                    required
                    className="border border-black rounded p-1"
                    onChange={(e) => {
                      mintAmount.current = Number(e.target.value);
                    }}
                  />
                  <p
                    className="inline-block ml-2 underline text-blue-600 cursor-pointer"
                    onClick={() => {
                      const value =
                        collectionInfo.userLimit -
                        collectionInfo.userMintedAmount;
                      const input = document.getElementById(
                        "mint-amount"
                      ) as HTMLInputElement;
                      input.value = value.toString();
                      mintAmount.current = value;
                    }}
                  >
                    Max
                  </p>
                  <button className="block mx-auto my-5 text-xl font-bold border border-black rounded px-4 py-2 bg-purple-200">
                    Mint
                  </button>
                </form>
              </>
            ) : (
              <p className="text-center text-2xl my-3">
                You have already minted max amount
              </p>
            )}
          </div>
        </div>
      ) : (
        <>
          {!address ? (
            <ConnectButton style="mx-auto" />
          ) : (
            <p className="text-center text-2xl">Fetching data...</p>
          )}
        </>
      )}
    </div>
  );
}

//0x8572e9B939bC603D93b44e7B883f4fF5ec4c0a5f
