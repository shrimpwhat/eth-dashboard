import { ethers, BigNumber } from "ethers";
import { useContext, useState, createContext, useEffect } from "react";
import {
  useContractRead,
  useContractReads,
  useAccount,
  useContract,
  useSigner,
} from "wagmi";
import { TokenContext } from "..";
import ERC20ABI from "../../../utils/abi/ERC20";
import stakignFactoryABI from "../../../utils/abi/ERC20StakingFactory";
import stakingABI from "../../../utils/abi/ERC20Staking";
import { txAlert } from "../../../utils/components/Popups";
import MaxBalanceInput from "../../../utils/components/MaxValueInput";
import { useAddRecentTransaction } from "@rainbow-me/rainbowkit";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";
import { FormContainer, TextFieldElement } from "react-hook-form-mui";
import Container from "@mui/material/Container";

interface StakingData {
  duration?: ethers.BigNumber;
  totalSupply?: ethers.BigNumber;
  periodFinish?: ethers.BigNumber;
  rewardRate?: ethers.BigNumber;
  earned?: ethers.BigNumber;
  amount?: ethers.BigNumber;
}

const StakingDataContext = createContext<StakingData | undefined>({});

const StakingForm = () => {
  const addRecentTransaction = useAddRecentTransaction();
  const { tokenData } = useContext(TokenContext);
  const { address } = useAccount();
  const { data: signer } = useSigner();

  const factoryData = {
    address: process.env.REACT_APP_ERC20_STAKING_FACTORY as string,
    abi: stakignFactoryABI,
  };
  const factoryContract = useContract({
    ...factoryData,
    signerOrProvider: signer,
  });
  const { data: stakingAddress, refetch } = useContractRead({
    ...factoryData,
    functionName: "tokenStakings",
    args: [
      (tokenData?.address as `0x${string}`) ?? ethers.constants.AddressZero,
    ],
  });

  const { data: allowance } = useContractRead({
    address: tokenData?.address,
    abi: ERC20ABI,
    functionName: "allowance",
    args: [
      address ?? ethers.constants.AddressZero,
      stakingAddress ?? ethers.constants.AddressZero,
    ],
  });

  const stakingContractData = {
    address: stakingAddress,
    abi: stakingABI,
  };
  const stakingContract = useContract({
    ...stakingContractData,
    signerOrProvider: signer,
  });
  const { data: stakingData, refetch: refetchStaking } = useContractReads({
    contracts: [
      { ...stakingContractData, functionName: "duration" },
      { ...stakingContractData, functionName: "totalSupply" },
      { ...stakingContractData, functionName: "periodFinish" },
      { ...stakingContractData, functionName: "rewardRate" },
      {
        ...stakingContractData,
        functionName: "earned",
        args: [address ?? ethers.constants.AddressZero],
      },
      {
        ...stakingContractData,
        functionName: "balanceOf",
        args: [address ?? ethers.constants.AddressZero],
      },
    ],
    select: (data) => ({
      duration: data[0],
      totalSupply: data[1],
      periodFinish: data[2],
      rewardRate: data[3],
      earned: data[4],
      amount: data[5],
    }),
  });

  const handleReceipt = (
    receipt: ethers.ContractReceipt | undefined,
    description: string
  ) => {
    if (receipt) {
      addRecentTransaction({
        hash: receipt.transactionHash,
        description,
      });
      return receipt?.transactionHash;
    } else throw new Error("Tx receipt is undefined");
  };

  const setupStakingContract = async () => {
    const tx = await factoryContract?.createPool(
      tokenData?.address as `0x${string}`,
      BigNumber.from(365 * 86400)
    );
    const receipt = await tx?.wait();
    refetch();
    handleReceipt(receipt, `Deployed staking contract for ${tokenData?.name}`);
  };

  // const updateDuration = async () => {
  //   const tx = await stakingContract?.setRewardsDuration(
  //     BigNumber.from(newDuration.current)
  //   );
  //   const receipt = await tx?.wait();
  //   refetchStaking();
  //   handleReceipt(receipt, "Updated reward period duration");
  // };

  if (stakingAddress === ethers.constants.AddressZero) {
    console.log(stakingAddress);
    if (address !== tokenData?.owner) return null;
    else
      return (
        <Box>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="h6" sx={{ mb: 1 }}>
            Staking contract hasn't been setup yet
          </Typography>
          <Button
            variant="outlined"
            onClick={() =>
              txAlert(
                "Staking contract successfuly deployed",
                setupStakingContract()
              )
            }
          >
            Setup
          </Button>
        </Box>
      );
  } else
    return (
      <StakingDataContext.Provider value={stakingData}>
        <Stack gap={2}>
          <Divider />
          <Typography variant="h5">Staking</Typography>
          <StakingStats />
          <RecentStake />
          <DepositWithdraw />
          <Divider />
          <OwnerActions address={address} />
          {/* <p className="text-lg text-left">Contract: {stakingAddress}</p> */}
        </Stack>
      </StakingDataContext.Provider>
    );
};

const StakingStats = () => {
  const SECS_PER_YEAR = 365 * 86400;
  const getApr = () => {
    const rate = parseFloat(stakingData?.periodFinish?.toString() ?? "0");
    const totalStaked = parseFloat(stakingData?.totalSupply?.toString() ?? "0");
    return (rate * SECS_PER_YEAR) / totalStaked;
  };

  const { tokenData } = useContext(TokenContext);
  const stakingData = useContext(StakingDataContext);

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
      >
        <Typography sx={{ mb: 1 }} fontWeight="bold">
          APR
        </Typography>
        <Typography component="span" fontWeight="bold" color="primary.main">
          {getApr()} %
        </Typography>
      </Box>
      <Box
        border="1px solid black"
        p={2}
        borderRadius="10px"
        bgcolor="grey.100"
      >
        <Typography sx={{ mb: 1 }} fontWeight="bold">
          TVL
        </Typography>
        <Typography component="span" fontWeight="bold" color="primary.main">
          {ethers.utils.formatUnits(
            stakingData?.totalSupply ?? 0,
            tokenData?.decimals
          )}{" "}
          {tokenData?.symbol}
        </Typography>
      </Box>
      <Box
        border="1px solid black"
        p={2}
        borderRadius="10px"
        bgcolor="grey.100"
      >
        <Typography sx={{ mb: 1 }} fontWeight="bold">
          Reward period ends in
        </Typography>
        <Typography component="span" fontWeight="bold" color="primary.main">
          {stakingData?.periodFinish?.div(86400).toString()} days
        </Typography>
      </Box>
    </Box>
  );
};

const RecentStake = () => {
  const { tokenData } = useContext(TokenContext);
  const stakingData = useContext(StakingDataContext);

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
          defaultValue={`${ethers.utils.formatUnits(
            stakingData?.amount ?? 0,
            tokenData?.decimals
          )} ${tokenData?.symbol}`}
          inputProps={{ readOnly: true }}
          label="Staked amount"
        />
        <TextField
          defaultValue={`${ethers.utils.formatUnits(
            stakingData?.earned ?? 0,
            tokenData?.decimals
          )} ${tokenData?.symbol}`}
          inputProps={{ readOnly: true }}
          label="Recent profit"
        />
      </Box>
      <Box gap={1} display="flex" flexWrap="wrap" justifyContent="center">
        <Button variant="contained" sx={{ width: "120px" }}>
          Claim
        </Button>
        <Button variant="contained" sx={{ width: "120px" }}>
          Compound
        </Button>
      </Box>
    </>
  );
};

const DepositWithdraw = () => {
  const [type, setType] = useState<"deposit" | "withdraw">("deposit");
  const handleType = (
    event: React.MouseEvent<HTMLElement>,
    newType: "deposit" | "withdraw" | null
  ) => {
    if (newType !== null) setType(newType);
  };

  const { tokenData } = useContext(TokenContext);
  const stakingData = useContext(StakingDataContext);

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
      <FormContainer onSuccess={() => {}}>
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
          <Button
            type="submit"
            variant="contained"
            sx={{ width: "110px", height: "56px" }}
          >
            {type === "deposit" ? "Deposit" : "Withdraw"}
          </Button>
        </Container>
      </FormContainer>
    </>
  );
};

const OwnerActions = ({ address }: { address?: string }) => {
  const { tokenData } = useContext(TokenContext);
  const stakingData = useContext(StakingDataContext);

  return (
    <>
      {tokenData?.owner === address && (
        <Box>
          <FormContainer>
            <Typography variant="body2" mb={2}>
              Start new reward period
            </Typography>
            <Container
              maxWidth="sm"
              sx={{
                display: "flex",
                justifyContent: "center",
                flexWrap: "wrap",
                gap: 2,
              }}
            >
              <MaxBalanceInput
                label="Total rewards"
                fullWidth
                sx={{ maxWidth: "300px" }}
              />
              <Button type="submit" variant="contained" sx={{ height: "56px" }}>
                Start
              </Button>
            </Container>
          </FormContainer>
          <FormContainer
          // onSuccess={(e) => {
          //   e.preventDefault();
          //   txAlert("Duration updated", updateDuration());
          // }}
          >
            <Typography variant="body2" my={2}>
              Current duration of each reward period is:{" "}
              <Typography
                component="span"
                sx={{ whiteSpace: "nowrap", fontWeight: "bold" }}
              >
                {stakingData?.duration?.div(86400)?.toString()} days{" "}
              </Typography>
            </Typography>
            <Container
              maxWidth="sm"
              sx={{
                display: "flex",
                justifyContent: "center",
                flexWrap: "wrap",
                gap: 2,
              }}
            >
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
      )}
    </>
  );
};

export default StakingForm;
