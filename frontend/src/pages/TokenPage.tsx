import { ethers } from "ethers";
import { useParams } from "react-router-dom";
import { useContractReads, useSigner, useAccount } from "wagmi";
import abi from "../utils/abi/ERC20.json";
import Title from "../utils/components/Title";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function TokenPage() {
  const { address: contractAddress } = useParams();
  const { data: signer } = useSigner();
  const { address } = useAccount();

  const contract = {
    addressOrName: contractAddress as string,
    contractInterface: abi,
  };
  const { data, isFetching } = useContractReads({
    contracts: [
      {
        ...contract,
        functionName: "name",
      },
      {
        ...contract,
        functionName: "symbol",
      },
      {
        ...contract,
        functionName: "balanceOf",
        args: [address],
      },
    ],
  });

  if (isFetching || !address)
    return (
      <>
        <Title text={"Token page"} />
        {address ? (
          <h1 className="text-2xl font-bold text-center">Fetching data...</h1>
        ) : (
          <div className="max-w-max mx-auto">
            <ConnectButton />
          </div>
        )}
      </>
    );
  else
    return (
      <div>
        <Title text={"Token page"} />
        <div className="card text-xl">
          <h1 className="text-2xl font-semibold">{data?.at(0)}</h1>
          <p className="text-left">
            Balance:{" "}
            <span className="italic text-blue-500 font-bold">
              {ethers.utils.formatEther(data?.at(2) ?? 0)}
            </span>{" "}
            <span className="font-bold">{data?.at(1)}</span>
          </p>
        </div>
      </div>
    );
}
