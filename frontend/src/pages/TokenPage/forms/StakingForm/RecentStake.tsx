import { ethers } from "ethers";
import { useContext } from "react";
import { TokenContext } from "../..";
import { txAlert } from "../../../../utils/components/Popups";
import { useAddRecentTransaction } from "@rainbow-me/rainbowkit";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { StakingDataContext } from ".";
import floatValue from "../../../../utils/components/FloatValue";

const RecentStake = () => {
  const { tokenData, refetch: refetchBalance } = useContext(TokenContext);
  const { stakingData, refetchStaking, stakingContract } =
    useContext(StakingDataContext);
  const addRecentTransaction = useAddRecentTransaction();

  const claim = async () => {
    const tx = await stakingContract?.getReward();
    if (tx) {
      addRecentTransaction({
        hash: tx?.hash,
        description: `Claimed rewards from ${tokenData?.symbol} staking`,
      });
      await txAlert(
        `Claimed rewards from ${tokenData?.symbol} staking`,
        tx.wait()
      );
      refetchStaking?.();
      refetchBalance?.();
    }
  };

  const compoundStake = async () => {
    const tx = await stakingContract?.compound();
    if (tx) {
      addRecentTransaction({
        hash: tx?.hash,
        description: `Compound rewards from ${tokenData?.symbol} staking`,
      });
      await txAlert(
        `Compound rewards from ${tokenData?.symbol} staking`,
        tx.wait()
      );
      refetchStaking?.();
    }
  };

  return (
    <>
      <Box
        gap={2}
        display="flex"
        justifyContent="center"
        mt={2}
        flexWrap="wrap"
      >
        <TextField
          value={`${floatValue(
            ethers.utils.formatUnits(
              stakingData?.amount ?? 0,
              tokenData?.decimals
            ),
            8
          )} ${tokenData?.symbol}`}
          inputProps={{ readOnly: true }}
          label="Staked amount"
        />
        <TextField
          value={`${floatValue(
            ethers.utils.formatUnits(
              stakingData?.earned ?? 0,
              tokenData?.decimals
            ),
            8
          )} ${tokenData?.symbol}`}
          inputProps={{ readOnly: true }}
          label="Recent profit"
        />
      </Box>
      <Box gap={1} display="flex" flexWrap="wrap" justifyContent="center">
        <Button
          variant="contained"
          sx={{ width: "120px" }}
          onClick={claim}
          disabled={stakingData?.earned?.eq(0)}
        >
          Claim
        </Button>
        <Button
          variant="contained"
          sx={{ width: "120px" }}
          onClick={compoundStake}
          disabled={stakingData?.earned?.eq(0)}
        >
          Compound
        </Button>
      </Box>
    </>
  );
};

export default RecentStake;
