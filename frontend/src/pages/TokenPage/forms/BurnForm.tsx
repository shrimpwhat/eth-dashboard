import { ethers, BigNumber } from "ethers";
import Input from "../../../utils/components/Input";
import { errorAlert, txAlert } from "../../../utils/components/Popups";
import { useRef, ChangeEvent, FormEvent, useContext } from "react";
import { useAddRecentTransaction } from "@rainbow-me/rainbowkit";
import { TokenContext } from "../TokenPage";

const BurnForm = () => {
  const burnAmount = useRef("0");
  const addRecentTransaction = useAddRecentTransaction();

  const { token, tokenData, refetch } = useContext(TokenContext);

  const burnTokens = async (amount: BigNumber) => {
    const tx: ethers.ContractTransaction = await token?.burn(amount);
    addRecentTransaction({
      hash: tx.hash,
      description: `Burn ${ethers.utils.formatUnits(amount)} ${
        tokenData?.symbol
      }`,
    });
    await tx.wait();
    refetch();
    return tx.hash;
  };

  const handleBurn = (e: FormEvent) => {
    e.preventDefault();
    if (
      ethers.utils.parseEther(burnAmount.current).lte(tokenData?.balance ?? 0)
    )
      txAlert(
        `Successfully burned ${burnAmount.current} ${tokenData?.symbol}`,
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
            const balance = ethers.utils.formatEther(tokenData?.balance ?? 0);
            burnAmount.current = balance;
            input.value = balance;
          }}
        />
        <button className="submit-button">Burn</button>
      </form>
    </>
  );
};

export default BurnForm;
