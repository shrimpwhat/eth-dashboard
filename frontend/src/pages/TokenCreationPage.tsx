import Title from "../utils/components/Title";
import Input from "../utils/components/Input";
import FindContract from "../utils/components/FindContract";
import { useAccount, useContract, useSigner } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import TokenFactoryAbi from "../utils/abi/TokenFactory.json";
import { FormEvent } from "react";
import { ethers } from "ethers";
import { deployedTokenAlert } from "../utils/components/Popups";

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
        <form
          onSubmit={(e: FormEvent) => {
            e.preventDefault();
            deployedTokenAlert(createToken());
          }}
        >
          <div className="flex flex-col items-center w-1/3 mx-auto">
            <Input text="Name" id="token-name" className="mb-8" />
            <Input text="Symbol" id="token-symbol" className="mb-8" />
            <Input
              text="Initial supply"
              id="token-supply"
              type="number"
              min={0}
              step={1e-18}
              className="mb-8"
            />
            {isConnected ? (
              <button className="submit-button">Create</button>
            ) : (
              <ConnectButton />
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
