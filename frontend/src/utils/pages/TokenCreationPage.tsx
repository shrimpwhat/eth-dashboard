import Title from "../components/Title";
import Input from "../components/Input";
import { useAccount, useContract, useSigner } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import TokenFactoryAbi from "../abi/TokenFactory.json";
import { FormEvent } from "react";
import { ethers } from "ethers";
import { deployedTokenAlert } from "../components/Popups";

export default function TokenCreationPage() {
  const { isConnected } = useAccount();
  const { data: signer } = useSigner();

  const contract: ethers.Contract = useContract({
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

  const createToken = async () => {
    const { name, symbol, supply } = getTokenData();
    const tx: ethers.ContractTransaction = await contract.createToken(
      name,
      symbol,
      ethers.utils.parseEther(supply)
    );
    const receipt = await tx.wait();
    console.log(tx.hash);
    const tokenAddress = receipt.events?.at(3)?.args?.tokenAddress;
    return tokenAddress;
  };

  return (
    <div>
      <Title text="Create Token" />
      <form>
        <div className="flex text-xl flex-col items-center">
          <Input text="Name" id="token-name" />
          <Input text="Symbol" id="token-symbol" />
          <Input
            text="Initial supply"
            id="token-supply"
            type="number"
            min={0}
          />
          {isConnected ? (
            <button
              className="submit-button"
              onClick={(e: FormEvent) => {
                e.preventDefault();
                deployedTokenAlert(createToken());
              }}
            >
              Create
            </button>
          ) : (
            <ConnectButton />
          )}
        </div>
      </form>
    </div>
  );
}
