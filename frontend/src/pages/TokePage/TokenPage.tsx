import { ethers } from "ethers";
import { useParams } from "react-router-dom";
import { useContractReads, useAccount, useContract, useSigner } from "wagmi";
import abi from "../../utils/abi/ERC20";
import Title from "../../utils/components/Title";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { createContext } from "react";
import { TransferForm, MintForm, ApproveForm, BurnForm } from "./forms";

interface TokenContextInterface {
  token: ethers.Contract | null;
  tokenData?: [string, string, ethers.BigNumber, string];
  refetch: Function;
}

const TokenContext = createContext<TokenContextInterface>({
  token: null,
  tokenData: undefined,
  refetch: () => {},
});
export { TokenContext };

export default function TokenPage() {
  const { address: contractAddress } = useParams();
  const { address } = useAccount();
  const { data: signer } = useSigner();

  const contract = {
    address: contractAddress as string,
    abi,
  };
  const token = useContract({
    ...contract,
    signerOrProvider: signer,
  });

  const {
    data: tokenData,
    isFetching,
    isFetchedAfterMount,
    refetch,
  } = useContractReads({
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
        args: [address ?? ethers.constants.AddressZero],
      },
      {
        ...contract,
        functionName: "owner",
      },
    ],
  });

  if ((isFetching && !isFetchedAfterMount) || !address)
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
          <h1 className="text-2xl font-semibold">
            {tokenData?.at(0)?.toString()}
          </h1>
          <p className="text-left">
            Balance:{" "}
            <span className="italic text-blue-500 font-bold">
              {ethers.utils.formatEther(tokenData?.at(2) ?? "0")}
            </span>{" "}
            <span className="font-bold">{tokenData?.at(1) as string}</span>
          </p>
          <TokenContext.Provider value={{ token, tokenData, refetch }}>
            <MintForm />
            <TransferForm />
            <ApproveForm />
            <BurnForm />
          </TokenContext.Provider>
        </div>
      </div>
    );
}
