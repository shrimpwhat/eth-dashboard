import Title from "../components/Title";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";

const Index = () => {
  const { isConnected } = useAccount();
  return (
    <div>
      <Title text="Home" />
      <div className="text-2xl">
        <h2>Welcome to the Ethereum Dashboard! Here you can:</h2>
        <ul className="list-disc list-inside ml-5 my-5">
          <li>Mint your own NFT or create a collection</li>
          <li>
            Setup a staking contract for your collection with rewards in any
            token
          </li>
          <li>Create your own ERC-20 token</li>
          <li>Create a farming contract for your token</li>
          <li>
            Provide a liquidity to your tokenы and make them available for swaps
          </li>
        </ul>
        <h2>Connect wallet and start creating!</h2>
        {!isConnected && (
          <div className="mx-auto max-w-max mt-6">
            <ConnectButton />
          </div>
        )}
      </div>
    </div>
  );
};
export default Index;
