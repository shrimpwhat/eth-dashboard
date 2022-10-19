import Title from "../components/Title";
import Input from "../components/Input";
import FindContract from "../components/FindContract";
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
      <div className="text-xl">
        <FindContract url="/token/" text={"Token address"} />
        <form>
          <div className="flex flex-col items-center w-1/3 mx-auto">
            <Input text="Name" id="token-name" className="w-full" />
            <Input text="Symbol" id="token-symbol" className="w-full" />
            <Input
              text="Initial supply"
              id="token-supply"
              type="number"
              min={0}
              className="w-full"
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
    </div>
  );
}
