import { useParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useContract, useSigner, useAccount, useProvider } from "wagmi";
import Title from "../utils/components/Title";
import Collection from "../utils/abi/ERC721.json";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { nftMintAlert, txAlert } from "../utils/components/Popups";
import { ethers, BigNumber } from "ethers";
import { useAddRecentTransaction } from "@rainbow-me/rainbowkit";

interface CollectionInfo {
  name: string;
  price: BigNumber;
  userLimit: number;
  maxSupply: number;
  totalMinted: number;
  userMintedAmount: number;
  owner: string;
  contractBalance: string;
}

export default function CollectionPage() {
  const { address, isConnected } = useAccount();
  const { address: contractAddress } = useParams();
  const provider = useProvider({ chainId: 5 });
  const { data: signer } = useSigner();
  const contract = useContract({
    address: contractAddress as string,
    abi: Collection,
    signerOrProvider: signer,
  });
  const mintAmount = useRef(1);
  const addRecentTransaction = useAddRecentTransaction();

  const [collectionInfo, updateInfo]: [CollectionInfo, Function] = useState({
    name: "",
    price: BigNumber.from(0),
    userLimit: 0,
    maxSupply: 0,
    totalMinted: 0,
    userMintedAmount: 0,
    owner: "",
    contractBalance: "0",
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
        const owner = await contract.owner();
        const contractBalance = ethers.utils.formatEther(
          await provider.getBalance(contractAddress as string)
        );
        updateInfo({
          name,
          price,
          userLimit,
          totalMinted,
          maxSupply,
          userMintedAmount,
          owner,
          contractBalance,
        });
        setFetchStatus(true);
      }
    })();
  }, [contract, signer, address, contractAddress, provider]);

  const updateInfoAfterMint = async () => {
    const totalMinted = Number(await contract?.totalMinted());
    const userMintedAmount = Number(await contract?.numberMinted(address));
    const contractBalance = ethers.utils.formatEther(
      await provider.getBalance(contractAddress as string)
    );
    updateInfo({
      ...collectionInfo,
      totalMinted,
      userMintedAmount,
      contractBalance,
    });
  };

  const mint = async () => {
    const tx = await contract?.mint(mintAmount.current, {
      value: collectionInfo.price.mul(mintAmount.current).toString(),
    });
    addRecentTransaction({
      hash: tx.hash,
      description: `Mint ${mintAmount.current} tokens of ${collectionInfo.name}`,
    });
    const receipt = await tx.wait();
    updateInfoAfterMint();
    return receipt;
  };

  const withdraw = async () => {
    const tx = await contract?.withdraw();
    const receipt = await tx.wait();
    console.log(receipt.transactionHash);
    const contractBalance = ethers.utils.formatEther(
      await provider.getBalance(contractAddress as string)
    );
    updateInfo({
      ...collectionInfo,
      contractBalance,
    });
    return receipt.transactionHash;
  };

  return (
    <div>
      <Title text="Nft minting page" />
      {isFetched && isConnected ? (
        <div className="card">
          <h2 className="text-3xl mt-3">{collectionInfo.name}</h2>
          <p className="mt-4 text-xl">
            <span className="text-purple-600">
              {collectionInfo.maxSupply - collectionInfo.totalMinted}
            </span>
            /
            <span className="text-fuchsia-900">{collectionInfo.maxSupply}</span>{" "}
            Available
          </p>
          <p className="mt-4 text-xl">
            <strong>
              {ethers.utils.formatEther(collectionInfo.price)} ETH
            </strong>{" "}
            per token
          </p>
          <div className="text-center">
            {collectionInfo.userMintedAmount < collectionInfo.userLimit ? (
              <>
                <p className="mt-4 text-xl">
                  You can mint{" "}
                  <span className="text-rose-800">
                    {collectionInfo.userLimit - collectionInfo.userMintedAmount}
                  </span>{" "}
                  more nfts
                </p>
                <form
                  className="mt-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    nftMintAlert(mint());
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
              <p className="text-center text-2xl my-4">
                You have already minted max amount
              </p>
            )}
            {collectionInfo.owner === address && (
              <div>
                <h1>
                  Contract balance is{" "}
                  <span className="font-bold">
                    {collectionInfo.contractBalance}
                  </span>{" "}
                  ETH
                </h1>
                <button
                  className="block mx-auto my-5 text-lg border border-black rounded px-3 py-1 duration-500 hover:bg-black hover:text-white"
                  onClick={() => {
                    txAlert("Funds successfuly withdrawn!", withdraw());
                  }}
                >
                  Withdraw
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          {!address ? (
            <div className="flex">
              <div className="mx-auto">
                <ConnectButton />
              </div>
            </div>
          ) : (
            <p className="text-center text-2xl font-bold">Fetching data...</p>
          )}
        </>
      )}
    </div>
  );
}
