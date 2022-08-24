import { useParams } from "react-router-dom";
import { useContract, useSigner, useAccount } from "wagmi";
import Title from "./utils/components/Title";
import Collection from "./utils/abi/collection.json";
import ConnectButton from "./utils/components/ConnectButton";

export default function CollectionPage() {
  const { address } = useAccount();
  const { contractAddress } = useParams();
  const { data: signer } = useSigner();
  const contract = useContract({
    addressOrName: contractAddress as string,
    contractInterface: Collection.abi,
    signerOrProvider: signer,
  });

  return (
    <div>
      <Title text="Nft minting page" />
      <ConnectButton />
    </div>
  );
}
