import Title from "../components/Title";
import Input from "../components/Input";
import { useAccount, useContract, useSigner } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import TokenFactoryAbi from "../abi/TokenFactory.json";
import { FormEvent } from "react";

export default function TokenCreationPage() {
  const { isConnected } = useAccount();
  const { data: signer } = useSigner();

  const contract = useContract({
    addressOrName: process.env.REACT_APP_TOKEN_FACTORY ?? "",
    contractInterface: TokenFactoryAbi,
    signerOrProvider: signer,
  });

  const getTokenData = () => {
    const name = (document.getElementById("token-name") as HTMLInputElement)
      .value;
    const symbol = (document.getElementById("token-symbol") as HTMLInputElement)
      .value;
    const supply = (document.getElementById("token-supply") as HTMLInputElement)
      .value;
    return { name, symbol, supply };
  };

  const createToken = async (e: FormEvent) => {
    e.preventDefault();
    const { name, symbol, supply } = getTokenData();
    const tx = await contract.createToken(name, symbol, supply);
  };

  return (
    <div>
      <Title text="Create Token" />
      <form>
        <div className="flex text-xl flex-col items-center">
          <Input text="Name" id="token-name" />
          <Input text="Symbol" id="token-symbol" />
          <Input
            text="Initial supply(decs=18)"
            id="token-supply"
            type="number"
            min={0}
          />
          {isConnected ? (
            <button className="submit-button">Submit</button>
          ) : (
            <ConnectButton />
          )}
        </div>
      </form>
    </div>
  );
}
