import { ethers, BigNumber } from "ethers";
import { createContext } from "react";
import {
  useContractRead,
  useContractReads,
  useAccount,
  useContract,
  useSigner,
  useNetwork,
} from "wagmi";
import ERC20ABI from "../../../utils/abi/ERC20";
import stakignFactoryABI from "../../../utils/abi/ERC20StakingFactory";
import stakingABI from "../../../utils/abi/ERC20Staking";
import { txAlert } from "../../../utils/components/Popups";
import { useAddRecentTransaction } from "@rainbow-me/rainbowkit";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ArrowOutwardIcon from "@mui/icons-material/ArrowOutward";
import DepositWithdraw from "./DepositWithdraw";
import OwnerActions from "./OwnerActions";
import RecentStake from "./RecentStake";
import StakingStats from "./Stats";
import Link from "@mui/material/Link";
import { useState } from "react";
import FindContract from "../../../utils/components/FindContract";

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

const STAKING_FACTORY_ADDRESS = process.env.REACT_APP_ERC20_STAKING_FACTORY;

const Page = () => {
  const [address, setAddress] = useState("");

  return (
    <>
      <FindContract
        text="ERC20 contract address"
        onSuccess={({ address }) => setAddress(address)}
      />
      <StakingForm tokenAddress={address} />
    </>
  );
};

const StakingForm = ({ tokenAddress }: { tokenAddress: string }) => {
  const addRecentTransaction = useAddRecentTransaction();
  const { address } = useAccount();
  const { data: signer } = useSigner();
  const { chain } = useNetwork();

  const tokenContractData = {
    address: tokenAddress,
    abi: ERC20ABI,
  };
  const { data: tokenData } = useContractReads({
    contracts: [
      { ...tokenContractData, functionName: "name" },
      { ...tokenContractData, functionName: "symbol" },
      { ...tokenContractData, functionName: "owner" },
    ],
    select: (data) => ({
      name: data?.at(0),
      symbol: data?.at(1),
      owner: data?.at(2),
    }),
  });
  const token = useContract({
    ...tokenContractData,
    signerOrProvider: signer,
  });

  const factoryData = {
    address: STAKING_FACTORY_ADDRESS,
    abi: stakignFactoryABI,
  };
  const factoryContract = useContract({
    ...factoryData,
    signerOrProvider: signer,
  });
  const { data: stakingAddress, refetch } = useContractRead({
    ...factoryData,
    functionName: "tokenStakings",
    args: [(tokenAddress as `0x${string}`) ?? ethers.constants.AddressZero],
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
    address: tokenAddress,
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
      stakingContract?.address ?? ethers.constants.AddressZero,
      ethers.constants.MaxUint256
    );
    if (tx) {
      addRecentTransaction({
        hash: tx?.hash,
        description: `Approved ${tokenData?.symbol} for staking contract`,
      });
      await txAlert(
        `Approved ${tokenData?.symbol} for staking contract`,
        tx.wait(),
        chain?.blockExplorers?.default?.url
      );
      refetchAllowance?.();
    }
  };

  const setupStakingContract = async () => {
    const tx = await factoryContract?.createPool(
      tokenAddress as `0x${string}`,
      BigNumber.from(365 * 86400)
    );
    if (tx) {
      addRecentTransaction({
        hash: tx?.hash,
        description: `Deployed staking contract for ${tokenData?.name}`,
      });
      await txAlert(
        "Staking contract successfuly deployed",
        tx.wait(),
        chain?.blockExplorers?.default?.url
      );
      refetch();
    }
  };

  if (stakingAddress === ethers.constants.AddressZero) {
    return (
      <Box>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="h6" sx={{ mb: 1 }}>
          Staking contract hasn't been setup yet
        </Typography>
        {address === tokenData?.owner && (
          <Button variant="outlined" onClick={setupStakingContract}>
            Setup
          </Button>
        )}
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
            <Box display="flex" gap={2} justifyContent="center" flexWrap="wrap">
              <Button
                size="small"
                variant="outlined"
                onClick={() =>
                  navigator.clipboard.writeText(
                    stakingAddress ?? ethers.constants.AddressZero
                  )
                }
              >
                Contract Address
                <ContentCopyIcon sx={{ fontSize: 15 }} />
              </Button>
              <Button variant="outlined" size="small">
                <Link
                  target="_blank"
                  rel="noreferrer"
                  underline="none"
                  href={`${chain?.blockExplorers?.default}/address/${stakingAddress}`}
                >
                  Explorer <ArrowOutwardIcon sx={{ fontSize: 15 }} />
                </Link>
              </Button>
            </Box>
          </Stack>
        </StakingDataContext.Provider>
      );
  }
};

export default Page;
