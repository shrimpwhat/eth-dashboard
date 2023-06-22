import { ethers } from "ethers";
import { useContext } from "react";
import { txAlert } from "../../../utils/components/Popups";
import MaxBalanceInput from "../../../utils/components/MaxValueInput";
import { useAddRecentTransaction } from "@rainbow-me/rainbowkit";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import { FormContainer, TextFieldElement } from "react-hook-form-mui";
import Container from "@mui/material/Container";
import { StakingDataContext } from ".";
import { useNetwork } from "wagmi";

const OwnerActions = ({ address }: { address?: string }) => {
  const {
    stakingData,
    allowance,
    approve,
    stakingContract,
    refetchStaking,
    tokenData,
  } = useContext(StakingDataContext);
  const addRecentTransaction = useAddRecentTransaction();
  const { chain } = useNetwork();

  const startPeriod = async ({ amount }: { amount: string }) => {
    const tx = await stakingContract?.notifyRewardAmount(
      ethers.utils.parseUnits(amount, tokenData?.decimals)
    );
    if (tx) {
      addRecentTransaction({
        hash: tx?.hash,
        description: `Started new reward period of ${tokenData?.symbol} staking`,
      });
      await txAlert(
        `Started new reward period of ${tokenData?.symbol} staking`,
        tx.wait(),
        chain?.blockExplorers?.default.url
      );
      refetchStaking?.();
    }
  };

  const updateDuration = async ({ duration }: { duration: string }) => {
    const tx = await stakingContract?.setRewardsDuration(duration);
    if (tx) {
      addRecentTransaction({
        hash: tx?.hash,
        description: `Updated duration in ${tokenData?.symbol} staking`,
      });
      await txAlert(
        `Updated duration in ${tokenData?.symbol} staking`,
        tx.wait(),
        chain?.blockExplorers?.default.url
      );
      refetchStaking?.();
    }
  };

  if (tokenData?.owner !== address) return null;
  else
    return (
      <Box>
        <Divider sx={{ mb: 4, mt: -1 }} />
        <Box display="flex" gap={3} justifyContent="center" flexWrap="wrap">
          <FormContainer onSuccess={startPeriod}>
            <Container
              maxWidth="sm"
              sx={{
                display: "flex",
                justifyContent: "center",
                flexWrap: "wrap",
                gap: 2,
              }}
            >
              <Typography variant="body2" textAlign="center">
                Start new reward period
              </Typography>
              <MaxBalanceInput
                label="Total rewards"
                fullWidth
                sx={{ maxWidth: "300px" }}
              />
              {allowance?.eq(0) ? (
                <Button
                  variant="contained"
                  sx={{ height: "56px" }}
                  onClick={approve}
                >
                  Approve
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="contained"
                  sx={{ height: "56px" }}
                >
                  Start
                </Button>
              )}
            </Container>
          </FormContainer>
          <FormContainer onSuccess={updateDuration}>
            <Container
              maxWidth="sm"
              sx={{
                display: "flex",
                justifyContent: "center",
                flexWrap: "wrap",
                gap: 2,
              }}
            >
              <Typography variant="body2" textAlign="center">
                Current duration of each reward period is:{" "}
                <Typography
                  component="span"
                  sx={{ whiteSpace: "nowrap", fontWeight: "bold" }}
                >
                  {stakingData?.duration?.div(86400)?.toString()} days{" "}
                </Typography>
              </Typography>
              <TextFieldElement
                name="duration"
                label="New duration(in seconds)"
                type="number"
                required
                inputProps={{ min: 1 }}
                validation={{
                  min: { value: 1, message: "Must be greater than 0" },
                }}
                fullWidth
                sx={{ maxWidth: "300px" }}
              />
              <Button type="submit" variant="contained" sx={{ height: "56px" }}>
                Update
              </Button>
            </Container>
          </FormContainer>
        </Box>
      </Box>
    );
};

export default OwnerActions;
