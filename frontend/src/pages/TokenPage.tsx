import { ethers, BigNumber } from "ethers";
import { useParams } from "react-router-dom";
import { useContractReads, useAccount, useContract, useSigner } from "wagmi";
import abi from "../utils/abi/ERC20.json";
import Title from "../utils/components/Title";
import Input from "../utils/components/Input";
import { errorAlert, TransferAlert } from "../utils/components/Popups";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useRef, ChangeEvent, FormEvent } from "react";

export default function TokenPage() {
  const approveAddress = useRef("");
  const approveAmount = useRef("0");

  const transferAddress = useRef("");
  const transferAmount = useRef("0");

  const burnAmount = useRef("0");
  const mintAmount = useRef("0");

  const { address: contractAddress } = useParams();
  const { address } = useAccount();

  const { data: signer } = useSigner();

  const contract = {
    addressOrName: contractAddress as string,
    contractInterface: abi,
  };

  const token = useContract({
    ...contract,
    signerOrProvider: signer,
  });

  const { data, isFetching, refetch } = useContractReads({
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

  const transferTokens = async (address: string, amount: BigNumber) => {
    const tx = await token.transfer(address, amount);
    await tx.wait();
    refetch();
    return tx.hash;
  };

  const handleTransfer = (e: FormEvent) => {
    e.preventDefault();
    if (!ethers.utils.isAddress(transferAddress.current))
      errorAlert("Invalid address", "invalid-transfer-address");
    else if (
      BigNumber.from(data?.at(2)).lt(
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
          <hr className="my-8" />
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
            <div>
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
            </div>
            <button className="submit-button">Transfer</button>
          </form>
        </div>
      </div>
    );
}
