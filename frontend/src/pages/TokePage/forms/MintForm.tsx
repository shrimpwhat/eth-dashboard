import { ethers, BigNumber } from "ethers";
import { useAccount } from "wagmi";
import Input from "../../../utils/components/Input";
import { errorAlert, txAlert } from "../../../utils/components/Popups";
import { useRef, ChangeEvent, FormEvent, useContext } from "react";
import { useAddRecentTransaction } from "@rainbow-me/rainbowkit";
import { TokenContext } from "../TokenPage";

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
    tokenData?: [string, string, ethers.BigNumber, string];
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
    refetch?.();
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

  if (tokenData?.at(3) !== address) return null;
  else
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

export default MintForm;
