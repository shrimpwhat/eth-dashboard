import { ethers, BigNumber } from "ethers";
import Input from "../../../utils/components/Input";
import { errorAlert, txAlert } from "../../../utils/components/Popups";
import { useRef, ChangeEvent, FormEvent, useContext } from "react";
import { useAddRecentTransaction } from "@rainbow-me/rainbowkit";
import { TokenContext } from "../TokenPage";

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
    tokenData?: [string, string, ethers.BigNumber, string];
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

export default ApproveForm;
