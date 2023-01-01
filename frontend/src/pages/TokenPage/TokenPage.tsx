import { ethers, BigNumber, BigNumberish } from "ethers";
import { useParams } from "react-router-dom";
import {
  useToken,
  useAccount,
  useContract,
  useSigner,
  useContractReads,
} from "wagmi";
import abi from "../../utils/abi/ERC20";
import Title from "../../utils/components/Title";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { createContext } from "react";
import { TransferForm, MintForm, ApproveForm, BurnForm } from "./forms";

interface TokenProps {
  address?: string;
  decimals?: number;
  name?: string;
  symbol?: string;
  owner?: string;
  totalSupply?: {
    formatted: string;
    value: BigNumber;
  };
  balance: BigNumberish;
}

interface TokenContextInterface {
  token: ethers.Contract | null;
  tokenData?: TokenProps;
  refetch: Function;
}

const TokenContext = createContext<TokenContextInterface>({
  token: null,
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

  const { data, refetch } = useContractReads({
    contracts: [
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

  const tokenInfo = useToken({ address: contractAddress as `0x${string}` });

  if ((tokenInfo.isFetching && !tokenInfo.isFetchedAfterMount) || !address)
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
          <h1 className="text-2xl font-semibold">{tokenInfo.data?.name}</h1>
          <h2 className="my-2">{contractAddress}</h2>
          <p className="text-left">
            Balance:{" "}
            <span className="italic text-blue-500 font-bold">
              {ethers.utils.formatEther(data?.at(0) ?? 0)}
            </span>{" "}
            <span className="font-bold">{tokenInfo.data?.symbol}</span>
          </p>
          <TokenContext.Provider
            value={{
              token,
              tokenData: {
                balance: data?.at(0) ?? 0,
                owner: data?.at(1) as string,
                ...tokenInfo?.data,
              },
              refetch,
            }}
          >
            <MintForm />
            <TransferForm />
            <ApproveForm />
            <BurnForm />
          </TokenContext.Provider>
        </div>
      </div>
    );
}
