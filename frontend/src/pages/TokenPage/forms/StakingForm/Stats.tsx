import { ethers } from "ethers";
import { useContext } from "react";
import floatValue from "../../../../utils/components/FloatValue";
import { TokenContext } from "../..";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { StakingDataContext } from ".";

const StakingStats = () => {
  const SECS_PER_YEAR = 365 * 86400;
  const { tokenData } = useContext(TokenContext);
  const { stakingData } = useContext(StakingDataContext);

  const getApr = () => {
    const rate = parseFloat(stakingData?.rewardRate?.toString() ?? "0");
    const totalStaked = parseFloat(stakingData?.totalSupply?.toString() ?? "0");
    return (rate * SECS_PER_YEAR) / totalStaked;
  };

  const daysLeft = () => {
    const finish = stakingData?.periodFinish?.toNumber();
    if (finish) {
      return Math.floor((finish - Date.now() / 1000) / 86400);
    }
  };

  return (
    <Box
      display="flex"
      gap={2}
      mx="auto"
      flexWrap="wrap"
      justifyContent="center"
    >
      <Box
        border="1px solid black"
        p={2}
        borderRadius="10px"
        bgcolor="grey.100"
        width="150px"
      >
        <Typography sx={{ mb: 1 }} fontWeight="bold">
          APR
        </Typography>
        <Typography component="span" fontWeight="bold" color="primary.main">
          {`${floatValue(getApr(), 3)} %`}
        </Typography>
      </Box>
      <Box
        border="1px solid black"
        p={2}
        borderRadius="10px"
        bgcolor="grey.100"
        width="150px"
      >
        <Typography sx={{ mb: 1 }} fontWeight="bold">
          TVL
        </Typography>
        <Typography component="span" fontWeight="bold" color="primary.main">
          {`${floatValue(
            ethers.utils.formatUnits(
              stakingData?.totalSupply ?? 0,
              tokenData?.decimals
            ),
            3
          )} ${tokenData?.symbol}`}
        </Typography>
      </Box>
      <Box
        border="1px solid black"
        p={2}
        borderRadius="10px"
        bgcolor="grey.100"
        width="150px"
      >
        <Typography sx={{ mb: 1 }} fontWeight="bold">
          Rewards
        </Typography>
        <Typography component="span" fontWeight="bold" color="primary.main">
          {`${floatValue(
            ethers.utils.formatUnits(stakingData?.rewards ?? 0),
            3
          )} ${tokenData?.symbol}`}
        </Typography>
      </Box>
      <Box
        border="1px solid black"
        p={2}
        borderRadius="10px"
        bgcolor="grey.100"
        width="150px"
      >
        <Typography sx={{ mb: 1 }} fontWeight="bold">
          Period ends in
        </Typography>
        <Typography component="span" fontWeight="bold" color="primary.main">
          {daysLeft()} days
        </Typography>
      </Box>
    </Box>
  );
};

export default StakingStats;
