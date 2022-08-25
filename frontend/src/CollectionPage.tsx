import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useContractReads, useSigner, useAccount } from "wagmi";
import Title from "./utils/components/Title";
import Collection from "./utils/abi/collection.json";
import ConnectButton from "./utils/components/ConnectButton";
import { ethers, BigNumber } from "ethers";

interface CollectionInfo {
  name: string;
  price: BigNumber;
}

export default function CollectionPage() {
  const { address } = useAccount();
  const { address: contractAddress } = useParams();
  const { data: signer } = useSigner();
  // const contract: ethers.Contract = useContractReads({
  //   addressOrName: contractAddress as string,
  //   contractInterface: Collection.abi,
  //   signerOrProvider: signer,
  // });
  const [collectionInfo, updateInfo] = useState({});

  return (
    <div>
      <Title text="Nft minting page" />
      <ConnectButton />
    </div>
  );
}

//0x8572e9B939bC603D93b44e7B883f4fF5ec4c0a5f
