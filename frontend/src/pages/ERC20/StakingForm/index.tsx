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
import CircularProgress from "@mui/material/CircularProgress";

interface StakingData {
  address?: string;
  duration?: BigNumber;
  totalSupply?: BigNumber;
  periodFinish?: BigNumber;
  rewardRate?: BigNumber;
  earned?: BigNumber;
  amount?: BigNumber;
  rewards?: BigNumber;
}

interface TokenData {
  name?: string;
  symbol?: string;
  owner?: string;
  decimals?: number;
  balance?: BigNumber;
}

interface StakingContext {
  stakingData?: StakingData;
  tokenData?: TokenData;
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
      {address && <StakingForm tokenAddress={address} />}
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
  const { data: tokenData, isFetchedAfterMount: isTokenDataFetched } =
    useContractReads({
      contracts: [
        { ...tokenContractData, functionName: "name" },
        { ...tokenContractData, functionName: "symbol" },
        { ...tokenContractData, functionName: "owner" },
        { ...tokenContractData, functionName: "decimals" },
        {
          ...tokenContractData,
          functionName: "balanceOf",
          args: [address ?? ethers.constants.AddressZero],
        },
      ],
      select: (data) => ({
        name: data[0],
        symbol: data[1],
        owner: data[2],
        decimals: data[3],
        balance: data[4],
      }),
      watch: true,
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

  if (!isTokenDataFetched || !isFetchedAfterMount)
    return (
      <Box>
        <Typography variant="h5" gutterBottom>
          Staking
        </Typography>
        <Typography variant="h5" mt={5}>
          Fetching data
          <CircularProgress size="30px" sx={{ ml: 2 }} />
        </Typography>
      </Box>
    );
  else if (stakingAddress === ethers.constants.AddressZero) {
    return (
      <Box>
        <Typography variant="h5" mb={3}>
          Staking
        </Typography>
        <Box textAlign="center">
          <Typography variant="h6" sx={{ mb: 1 }}>
            Staking contract hasn't been setup yet
          </Typography>
          {address === tokenData?.owner && (
            <Button variant="outlined" onClick={setupStakingContract}>
              Setup
            </Button>
          )}
        </Box>
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
            tokenData,
          }}
        >
          <Typography variant="h5">Staking</Typography>
          <Box
            display="flex"
            gap={2}
            my={3}
            justifyContent="center"
            flexWrap="wrap"
          >
            <Button
              size="small"
              sx={{ width: "190px" }}
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
            <Button variant="outlined" size="small" sx={{ width: "190px" }}>
              <Link
                target="_blank"
                rel="noreferrer"
                underline="none"
                href={`${chain?.blockExplorers?.default.url}/address/${stakingAddress}`}
              >
                Explorer <ArrowOutwardIcon sx={{ fontSize: 15 }} />
              </Link>
            </Button>
          </Box>
          <Stack gap={7}>
            <StakingStats />
            <RecentStake />
            <DepositWithdraw />
            <OwnerActions address={address} />
          </Stack>
        </StakingDataContext.Provider>
      );
  }
};

export default Page;
