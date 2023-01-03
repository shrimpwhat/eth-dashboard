import { ethers, BigNumber } from "ethers";
import { ChangeEvent, useContext, useRef } from "react";
import {
  useContractRead,
  useContractReads,
  useAccount,
  useContract,
  useSigner,
} from "wagmi";
import { TokenContext } from "..";
import erc20StakingFactoryAbi from "../../../utils/abi/ERC20StakingFactory";
import erc20StakingAbi from "../../../utils/abi/ERC20Staking";
import Input from "../../../utils/components/Input";
import { txAlert } from "../../../utils/components/Popups";
import { useAddRecentTransaction } from "@rainbow-me/rainbowkit";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { Divider } from "@mui/material";

const StakingForm = () => {
  const SECS_PER_YEAR = 365 * 86400;

  const addRecentTransaction = useAddRecentTransaction();
  const { tokenData } = useContext(TokenContext);
  const { address } = useAccount();
  const { data: signer } = useSigner();
  const newDuration = useRef("0");

  const factoryData = {
    address: process.env.REACT_APP_ERC20_STAKING_FACTORY as string,
    abi: erc20StakingFactoryAbi,
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
    abi: erc20StakingAbi,
  };
  const stakingContract = useContract({
    ...stakingContractData,
    signerOrProvider: signer,
  });
  const { data, refetch: refetchStaking } = useContractReads({
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
        functionName: "periodFinish",
      },
    ],
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

  const updateDuration = async () => {
    const tx = await stakingContract?.setRewardsDuration(
      BigNumber.from(newDuration.current)
    );
    const receipt = await tx?.wait();
    refetchStaking();
    handleReceipt(receipt, "Updated reward period duration");
  };

  const getApr = () => {
    const rate = parseFloat(data?.at(3)?.toString() ?? "0");
    const totalStaked = parseFloat(data?.at(1)?.toString() ?? "0");
    return (rate * SECS_PER_YEAR) / totalStaked;
  };

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
      <div>
        <Divider />
        <h2 className="font-bold mb-3">Staking</h2>

        <div className="my-5 flex justify-between">
          <p>
            TVL:{" "}
            <span className="font-bold">
              {ethers.utils.formatEther(data?.at(1) ?? 0)} {tokenData?.symbol}
            </span>
          </p>
          <p>
            Reward period ends in:{" "}
            <span className="whitespace-nowrap font-bold">
              {data?.at(6)?.div(86400).toString()} days
            </span>
          </p>
          <p>
            APR: <span className="font-bold">{getApr()} %</span>
          </p>
          <p>
            Your stake:{" "}
            <span className="font-bold">
              {ethers.utils.formatEther(data?.at(5) ?? 0)} {tokenData?.symbol}
            </span>
          </p>
        </div>
        {tokenData?.owner === address && (
          <div className="flex justify-evenly items-center">
            <form>
              <h2>Start new period</h2>
              <Input text="Rewards amount" id="reward-amount" />
            </form>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                txAlert("Duration updated", updateDuration());
              }}
            >
              <div className="">
                <p className="w-80">
                  Current duration of each reward period is:{" "}
                  <span className="whitespace-nowrap font-bold">
                    {data?.at(0)?.div(86400)?.toString()} days{" "}
                  </span>
                </p>
                <Input
                  text="New duration(in seconds)"
                  id="duration"
                  type="number"
                  min={1}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    newDuration.current = e.target.value;
                  }}
                />
                <button className="submit-button">Update</button>
              </div>
            </form>
          </div>
        )}
        <p className="text-lg text-left">Contract: {stakingAddress}</p>
      </div>
    );
};

export default StakingForm;
