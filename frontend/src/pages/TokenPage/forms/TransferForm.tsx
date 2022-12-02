import { ethers, BigNumber } from "ethers";
import Input from "../../../utils/components/Input";
import { errorAlert, txAlert } from "../../../utils/components/Popups";
import { useRef, ChangeEvent, FormEvent, useContext } from "react";
import { useAddRecentTransaction } from "@rainbow-me/rainbowkit";
import { TokenContext } from "../TokenPage";

const TransferForm = () => {
  const transferAddress = useRef("");
  const transferAmount = useRef("0");
  const addRecentTransaction = useAddRecentTransaction();

  const { token, tokenData, refetch } = useContext(TokenContext);

  const transferTokens = async (address: string, amount: BigNumber) => {
    const tx: ethers.ContractTransaction = await token?.transfer(
      address,
      amount
    );
    addRecentTransaction({
      hash: tx.hash,
      description: `Transfer ${ethers.utils.formatUnits(amount)} ${
        tokenData?.symbol
      }`,
    });
    await tx.wait();
    refetch?.();
    return tx.hash;
  };

  const handleTransfer = (e: FormEvent) => {
    e.preventDefault();
    if (!ethers.utils.isAddress(transferAddress.current))
      errorAlert("Invalid transfer address", "invalid-transfer-address");
    else if (
      BigNumber.from(tokenData?.balance).lt(
        ethers.utils.parseEther(transferAmount.current)
      )
    )
      errorAlert(
        "Insufficient balance for transfer",
        "invalid-transfer-amount"
      );
    else {
      txAlert(
        `Successfully transfered ${transferAmount.current} ${tokenData?.symbol}`,
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
              const balance = ethers.utils.formatEther(tokenData?.balance ?? 0);
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
export default TransferForm;
