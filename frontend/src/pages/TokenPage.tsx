import { ethers, BigNumber } from "ethers";
import { useParams } from "react-router-dom";
import { useContractReads, useAccount, useContract, useSigner } from "wagmi";
import abi from "../utils/abi/ERC20";
import Title from "../utils/components/Title";
import Input from "../utils/components/Input";
import { errorAlert, txAlert } from "../utils/components/Popups";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  useRef,
  ChangeEvent,
  FormEvent,
  useContext,
  createContext,
} from "react";
import { useAddRecentTransaction } from "@rainbow-me/rainbowkit";

interface TokenContextInterface {
  token: ethers.Contract | null;
  tokenData?: [string, string, ethers.BigNumber];
  refetch: Function;
}

const TokenContext = createContext<TokenContextInterface>({
  token: null,
  tokenData: undefined,
  refetch: () => {},
});

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
            <TransferForm />
            <ApproveForm />
            <MintForm />
            <BurnForm />
          </TokenContext.Provider>
        </div>
      </div>
    );
}

const TransferForm = ({}) => {
  const transferAddress = useRef("");
  const transferAmount = useRef("0");
  const addRecentTransaction = useAddRecentTransaction();

  const {
    token,
    tokenData,
    refetch,
  }: {
    token: ethers.Contract | null;
    tokenData?: [string, string, ethers.BigNumber];
    refetch?: Function;
  } = useContext(TokenContext);

  const transferTokens = async (address: string, amount: BigNumber) => {
    const tx: ethers.ContractTransaction = await token?.transfer(
      address,
      amount
    );
    addRecentTransaction({
      hash: tx.hash,
      description: `Transfer ${ethers.utils.formatUnits(
        amount
      )} ${tokenData?.at(1)}`,
    });
    await tx.wait();
    refetch();
    return tx.hash;
  };

  const handleTransfer = (e: FormEvent) => {
    e.preventDefault();
    if (!ethers.utils.isAddress(transferAddress.current))
      errorAlert("Invalid transfer address", "invalid-transfer-address");
    else if (
      BigNumber.from(tokenData?.at(2)).lt(
        ethers.utils.parseEther(transferAmount.current)
      )
    )
      errorAlert(
        "Insufficient balance for transfer",
        "invalid-transfer-amount"
      );
    else {
      txAlert(
        `Successfully transfered ${transferAmount.current} ${tokenData?.at(1)}`,
        transferTokens(
          transferAddress.current,
          ethers.utils.parseEther(transferAmount.current)
        )
      );
    }
  };

  return (
    <>
      <hr className="mt-8 mb-5" />
      <form
        className="flex flex-wrap items-end justify-around gap-6"
        onSubmit={handleTransfer}
      >
        <Input
          text="Transfer address"
          id="transfer-address"
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            transferAddress.current = e.target.value;
          }}
        />
        <div className="flex flex-row items-end gap-3">
          <Input
            text="Transfer amount"
            id="transfer-amount"
            type="number"
            min={0}
            step={1e-18}
            className="w-40"
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              transferAmount.current = e.target.value;
            }}
            maxText="max"
            maxFn={() => {
              const input = document.getElementById(
                "transfer-amount"
              ) as HTMLInputElement;
              const balance = ethers.utils.formatEther(
                tokenData?.at(2)?.toString() as string
              );
              transferAmount.current = balance;
              input.value = balance;
            }}
          />
        </div>
        <button className="submit-button">Transfer</button>
      </form>
    </>
  );
};

const ApproveForm = () => {
  const approveAddress = useRef("");
  const approveAmount = useRef("0");
  const addRecentTransaction = useAddRecentTransaction();

  const {
    token,
    tokenData,
    refetch,
  }: {
    token: ethers.Contract | null;
    tokenData?: [string, string, ethers.BigNumber];
    refetch?: Function;
  } = useContext(TokenContext);

  const approveTokens = async (address: string, amount: BigNumber) => {
    const tx: ethers.ContractTransaction = await token?.approve(
      address,
      amount
    );
    addRecentTransaction({
      hash: tx.hash,
      description: `Approve ${tokenData?.at(1)}`,
    });
    await tx.wait();
    refetch();
    return tx.hash;
  };

  const handleApprove = (e: FormEvent) => {
    e.preventDefault();
    if (!ethers.utils.isAddress(approveAddress.current))
      errorAlert("Invalid approve address", "invalid-approve-address");
    else {
      txAlert(
        `Successfully approved ${tokenData?.at(1)}`,
        approveTokens(
          approveAddress.current,
          ethers.utils.parseEther(approveAmount.current)
        )
      );
    }
  };

  return (
    <>
      <hr className="mt-8 mb-5" />
      <form
        className="flex flex-wrap items-end justify-around gap-6"
        onSubmit={handleApprove}
      >
        <Input
          text="Approve address"
          id="approve-address"
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            approveAddress.current = e.target.value;
          }}
        />
        <div className="flex flex-row items-end gap-3">
          <Input
            text="Approve amount"
            id="approve-amount"
            type="number"
            min={0}
            step={1e-18}
            className="w-40"
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              approveAmount.current = e.target.value;
            }}
            maxText="max"
            maxFn={() => {
              const input = document.getElementById(
                "approve-amount"
              ) as HTMLInputElement;
              const maxValue = ethers.utils.formatEther(
                ethers.constants.MaxUint256
              );
              approveAmount.current = maxValue;
              input.value = maxValue;
            }}
          />
        </div>
        <button className="submit-button">Approve</button>
      </form>
    </>
  );
};

const MintForm = () => {
  const { address } = useAccount();
  const mintAddress = useRef("");
  const mintAmount = useRef("0");

  const {
    token,
    tokenData,
    refetch,
  }: {
    token: ethers.Contract | null;
    tokenData?: [string, string, ethers.BigNumber];
    refetch?: Function;
  } = useContext(TokenContext);

  const addRecentTransaction = useAddRecentTransaction();

  const mintTokens = async (address: string, amount: BigNumber) => {
    const tx: ethers.ContractTransaction = await token?.mintTo(address, amount);
    addRecentTransaction({
      hash: tx.hash,
      description: `Mint ${ethers.utils.formatUnits(amount)} ${tokenData?.at(
        1
      )}`,
    });
    await tx.wait();
    refetch();
    return tx.hash;
  };

  const handleMint = (e: FormEvent) => {
    e.preventDefault();
    if (!ethers.utils.isAddress(mintAddress.current))
      errorAlert("Invalid mint address", "invalid-mint-address");
    else {
      txAlert(
        `Successfully minted ${mintAmount.current} ${tokenData?.at(1)}`,
        mintTokens(
          mintAddress.current,
          ethers.utils.parseEther(mintAmount.current)
        )
      );
    }
  };

  return (
    <>
      <hr className="mt-8 mb-5" />
      <form
        className="flex flex-wrap items-end justify-around gap-6"
        onSubmit={handleMint}
      >
        <Input
          text="Mint to"
          id="mint-address"
          className="w-52"
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            mintAddress.current = e.target.value;
          }}
          maxText="current"
          maxFn={() => {
            const input = document.getElementById(
              "mint-address"
            ) as HTMLInputElement;
            mintAddress.current = address as string;
            input.value = address as string;
          }}
        />
        <div className="flex flex-row items-end gap-3">
          <Input
            text="Mint amount"
            className="w-52"
            id="mint-amount"
            type="number"
            min={0}
            step={1e-18}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              mintAmount.current = e.target.value;
            }}
          />
        </div>
        <button className="submit-button">Mint</button>
      </form>
    </>
  );
};

const BurnForm = () => {
  const burnAmount = useRef("0");
  const addRecentTransaction = useAddRecentTransaction();

  const {
    token,
    tokenData,
    refetch,
  }: {
    token: ethers.Contract | null;
    tokenData?: [string, string, ethers.BigNumber];
    refetch?: Function;
  } = useContext(TokenContext);

  const burnTokens = async (amount: BigNumber) => {
    const tx: ethers.ContractTransaction = await token?.burn(amount);
    addRecentTransaction({
      hash: tx.hash,
      description: `Burn ${ethers.utils.formatUnits(amount)} ${tokenData?.at(
        1
      )}`,
    });
    await tx.wait();
    refetch();
    return tx.hash;
  };

  const handleBurn = (e: FormEvent) => {
    e.preventDefault();
    if (
      ethers.utils
        .parseEther(burnAmount.current)
        .lte(tokenData?.at(2) as ethers.BigNumberish)
    )
      txAlert(
        `Successfully burned ${burnAmount.current} ${tokenData?.at(1)}`,
        burnTokens(ethers.utils.parseEther(burnAmount.current))
      );
    else errorAlert("Insufficient balance for transfer", "invalid-burn-amount");
  };

  return (
    <>
      <hr className="mt-8 mb-5" />
      <form
        className="flex flex-wrap items-end justify-center gap-6"
        onSubmit={handleBurn}
      >
        <Input
          text="Burn amont"
          id="burn-amount"
          className="w-52"
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            burnAmount.current = e.target.value;
          }}
          maxText="max"
          maxFn={() => {
            const input = document.getElementById(
              "burn-amount"
            ) as HTMLInputElement;
            const balance = ethers.utils.formatEther(
              tokenData?.at(2) as ethers.BigNumberish
            );
            burnAmount.current = balance;
            input.value = balance;
          }}
        />
        <button className="submit-button">Burn</button>
      </form>
    </>
  );
};
