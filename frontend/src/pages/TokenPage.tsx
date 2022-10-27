import { ethers, BigNumber } from "ethers";
import { useParams } from "react-router-dom";
import { useContractReads, useAccount, useContract, useSigner } from "wagmi";
import abi from "../utils/abi/ERC20.json";
import Title from "../utils/components/Title";
import Input from "../utils/components/Input";
import { errorAlert, TransferAlert } from "../utils/components/Popups";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useRef, ChangeEvent, FormEvent } from "react";
import { useAddRecentTransaction } from "@rainbow-me/rainbowkit";

export default function TokenPage() {
  const approveAddress = useRef("");
  const approveAmount = useRef("0");

  const burnAmount = useRef("0");
  const mintAmount = useRef("0");

  const { address: contractAddress } = useParams();
  const { address } = useAccount();
  const { data: signer } = useSigner();

  const contract = {
    addressOrName: contractAddress as string,
    contractInterface: abi,
  };
  const token: ethers.Contract = useContract({
    ...contract,
    signerOrProvider: signer,
  });

  const {
    data: tokenData,
    isFetching,
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
          <h1 className="text-2xl font-semibold">{tokenData?.at(0)}</h1>
          <p className="text-left">
            Balance:{" "}
            <span className="italic text-blue-500 font-bold">
              {ethers.utils.formatEther(tokenData?.at(2) ?? 0)}
            </span>{" "}
            <span className="font-bold">{tokenData?.at(1)}</span>
          </p>
          <hr className="my-8" />
          <TransferForm token={token} tokenData={tokenData} refetch={refetch} />
        </div>
      </div>
    );
}

const TransferForm = ({
  token,
  tokenData,
  refetch,
}: {
  token: ethers.Contract;
  tokenData: ethers.utils.Result[] | undefined;
  refetch: Function;
}) => {
  const transferAddress = useRef("");
  const transferAmount = useRef("0");

  const addRecentTransaction = useAddRecentTransaction();

  const transferTokens = async (address: string, amount: BigNumber) => {
    const tx: ethers.ContractTransaction = await token.transfer(
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
      errorAlert("Invalid address", "invalid-transfer-address");
    else if (
      BigNumber.from(tokenData?.at(2)).lt(
        ethers.utils.parseEther(transferAmount.current)
      )
    )
      errorAlert("Insufficient balance", "invalid-transfer-amount");
    else {
      TransferAlert(
        transferTokens(
          transferAddress.current,
          ethers.utils.parseEther(transferAmount.current)
        )
      );
    }
  };

  return (
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
        />
        <button
          className="mb-2 text-blue-500 underline text-lg"
          type="button"
          onClick={() => {
            const input = document.getElementById(
              "transfer-amount"
            ) as HTMLInputElement;
            const balance = ethers.utils.formatEther(
              tokenData?.at(2)?.toString() as string
            );
            transferAmount.current = balance;
            input.value = balance;
          }}
        >
          Max
        </button>
      </div>
      <button className="submit-button">Transfer</button>
    </form>
  );
};
