import { ethers } from "ethers";
import { useContext, useState } from "react";
import { TokenContext } from "../..";
import { txAlert } from "../../../../utils/components/Popups";
import MaxBalanceInput from "../../../../utils/components/MaxValueInput";
import { useAddRecentTransaction } from "@rainbow-me/rainbowkit";
import Button from "@mui/material/Button";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";
import { FormContainer } from "react-hook-form-mui";
import Container from "@mui/material/Container";
import { StakingDataContext } from ".";

const DepositWithdraw = () => {
  const [type, setType] = useState<"deposit" | "withdraw">("deposit");
  const handleType = (
    _: React.MouseEvent<HTMLElement>,
    newType: "deposit" | "withdraw" | null
  ) => {
    if (newType !== null) setType(newType);
  };
  const addRecentTransaction = useAddRecentTransaction();

  const { tokenData, refetch: refetchBalance } = useContext(TokenContext);
  const { stakingData, refetchStaking, allowance, approve, stakingContract } =
    useContext(StakingDataContext);

  const deposit = async ({ amount }: { amount: string }) => {
    const tx = await stakingContract?.stake(
      ethers.utils.parseUnits(amount, tokenData?.decimals)
    );
    if (tx) {
      addRecentTransaction({
        hash: tx?.hash,
        description: `Stake ${amount} ${tokenData?.symbol}`,
      });
      await txAlert(`Stake ${amount} ${tokenData?.symbol}`, tx.wait());
      refetchStaking?.();
      refetchBalance?.();
    }
  };

  const withdraw = async ({ amount }: { amount: string }) => {
    const tx = await stakingContract?.withdraw(
      ethers.utils.parseUnits(amount, tokenData?.decimals)
    );
    if (tx) {
      addRecentTransaction({
        hash: tx?.hash,
        description: `Withdraw ${amount} ${tokenData?.symbol} from staking`,
      });
      await txAlert(
        `Withdraw ${amount} ${tokenData?.symbol} from staking`,
        tx.wait()
      );
      refetchStaking?.();
      refetchBalance?.();
    }
  };

  return (
    <>
      <ToggleButtonGroup
        value={type}
        exclusive
        onChange={handleType}
        color="primary"
        sx={{ mx: "auto", mt: 2 }}
      >
        <ToggleButton value="deposit" sx={{ width: "105px" }}>
          Deposit
        </ToggleButton>
        <ToggleButton value="withdraw" sx={{ width: "105px" }}>
          Withdraw
        </ToggleButton>
      </ToggleButtonGroup>
      <FormContainer onSuccess={type === "deposit" ? deposit : withdraw}>
        <Container
          sx={{
            display: "flex",
            gap: 2,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
          maxWidth="sm"
        >
          <MaxBalanceInput
            label="Amount"
            maxValue={ethers.utils.formatUnits(
              (type === "deposit" ? tokenData?.balance : stakingData?.amount) ??
                0,
              tokenData?.decimals
            )}
            sx={{ maxWidth: "300px" }}
            fullWidth
          />
          {allowance?.eq(0) ? (
            <Button
              variant="contained"
              sx={{ width: "110px", height: "56px" }}
              onClick={approve}
            >
              Approve
            </Button>
          ) : (
            <Button
              type="submit"
              variant="contained"
              sx={{ width: "110px", height: "56px" }}
            >
              {type === "deposit" ? "Deposit" : "Withdraw"}
            </Button>
          )}
        </Container>
      </FormContainer>
    </>
  );
};

export default DepositWithdraw;
