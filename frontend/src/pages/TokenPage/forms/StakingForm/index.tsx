import { ethers, BigNumber } from "ethers";
import { useContext, createContext } from "react";
import {
  useContractRead,
  useContractReads,
  useAccount,
  useContract,
  useSigner,
} from "wagmi";
import { TokenContext } from "../..";
import ERC20ABI from "../../../../utils/abi/ERC20";
import stakignFactoryABI from "../../../../utils/abi/ERC20StakingFactory";
import stakingABI from "../../../../utils/abi/ERC20Staking";
import { txAlert } from "../../../../utils/components/Popups";
import { useAddRecentTransaction } from "@rainbow-me/rainbowkit";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import DepositWithdraw from "./DepositWithdraw";
import OwnerActions from "./OwnerActions";
import RecentStake from "./RecentStake";
import StakingStats from "./Stats";

interface StakingData {
  address?: string;
  duration?: ethers.BigNumber;
  totalSupply?: ethers.BigNumber;
  periodFinish?: ethers.BigNumber;
  rewardRate?: ethers.BigNumber;
  earned?: ethers.BigNumber;
  amount?: ethers.BigNumber;
  rewards?: ethers.BigNumber;
}

interface StakingContext {
  stakingData?: StakingData;
  stakingContract: ethers.Contract | null;
  refetchStaking?: () => Promise<any>;
  allowance?: ethers.BigNumber;
  approve?: () => Promise<any>;
}

const StakingDataContext = createContext<StakingContext>({
  stakingContract: null,
});
export { StakingDataContext };

const StakingForm = () => {
  const addRecentTransaction = useAddRecentTransaction();
  const { tokenData, token } = useContext(TokenContext);
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

  const stakingContractData = {
    address: stakingAddress,
    abi: stakingABI,
  };
  const stakingContract = useContract({
    ...stakingContractData,
    signerOrProvider: signer,
  });
  const {
    data: stakingData,
    refetch: refetchStaking,
    isFetchedAfterMount,
  } = useContractReads({
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
      {
        ...stakingContractData,
        functionName: "rewardPool",
      },
    ],
    select: (data) => ({
      address: stakingAddress,
      duration: data[0],
      totalSupply: data[1],
      periodFinish: data[2],
      rewardRate: data[3],
      earned: data[4],
      amount: data[5],
      rewards: data[6],
    }),
  });

  const { data: allowance, refetch: refetchAllowance } = useContractRead({
    address: tokenData?.address,
    abi: ERC20ABI,
    functionName: "allowance",
    args: [
      address ?? ethers.constants.AddressZero,
      (stakingContract?.address as `0x${string}`) ??
        ethers.constants.AddressZero,
    ],
  });

  const approve = async () => {
    const tx = await token?.approve(
      stakingContract?.address,
      ethers.constants.MaxUint256
    );
    await txAlert(
      `Approved ${tokenData?.symbol} for staking contract`,
      tx.wait()
    );
    refetchAllowance?.();
    addRecentTransaction({
      hash: tx?.hash,
      description: `Approved ${tokenData?.symbol} for staking contract`,
    });
  };

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

  if (stakingAddress === ethers.constants.AddressZero) {
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
  } else {
    if (!isFetchedAfterMount) return null;
    else
      return (
        <StakingDataContext.Provider
          value={{
            stakingData,
            stakingContract,
            refetchStaking,
            allowance,
            approve,
          }}
        >
          <Stack gap={2}>
            <Divider />
            <Typography variant="h5">Staking</Typography>
            <StakingStats />
            <RecentStake />
            <DepositWithdraw />
            <OwnerActions address={address} />
            {/* <p className="text-lg text-left">Contract: {stakingAddress}</p> */}
          </Stack>
        </StakingDataContext.Provider>
      );
  }
};

export default StakingForm;
