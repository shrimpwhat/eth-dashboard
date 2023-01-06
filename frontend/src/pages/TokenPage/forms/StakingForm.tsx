import { ethers, BigNumber } from "ethers";
import { ChangeEvent, useContext, useRef, useState } from "react";
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
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";
import { FormContainer, TextFieldElement, useForm } from "react-hook-form-mui";
import InputAdornment from "@mui/material/InputAdornment";

const StakingForm = () => {
  const SECS_PER_YEAR = 365 * 86400;

  const addRecentTransaction = useAddRecentTransaction();
  const { tokenData } = useContext(TokenContext);
  const { address } = useAccount();
  const { data: signer } = useSigner();
  const newDuration = useRef("0");

  const [type, setType] = useState<"deposit" | "withdraw">("deposit");
  const handleType = (
    event: React.MouseEvent<HTMLElement>,
    newType: "deposit" | "withdraw" | null
  ) => {
    if (newType !== null) setType(newType);
  };

  const stakeFormContext = useForm<{ amount: string }>();

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

  const updateDuration = async () => {
    const tx = await stakingContract?.setRewardsDuration(
      BigNumber.from(newDuration.current)
    );
    const receipt = await tx?.wait();
    refetchStaking();
    handleReceipt(receipt, "Updated reward period duration");
  };

  const getApr = () => {
    const rate = parseFloat(stakingData?.periodFinish?.toString() ?? "0");
    const totalStaked = parseFloat(stakingData?.totalSupply?.toString() ?? "0");
    return (rate * SECS_PER_YEAR) / totalStaked;
  };

  const handleMaxStake = () => {
    let amount;
    if (type === "deposit") amount = tokenData?.balance.toString();
    else amount = stakingData?.amount.toString();
    stakeFormContext.setValue(
      "amount",
      ethers.utils.formatUnits(amount ?? 0, tokenData?.decimals)
    );
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
      <Stack gap={2}>
        <Divider />
        <Typography variant="h5">Staking</Typography>
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

        <ToggleButtonGroup
          value={type}
          exclusive
          onChange={handleType}
          color="primary"
          sx={{ mx: "auto", mt: 3 }}
        >
          <ToggleButton value="deposit">Deposit</ToggleButton>
          <ToggleButton value="withdraw">Withdraw</ToggleButton>
        </ToggleButtonGroup>
        <FormContainer formContext={stakeFormContext} onSuccess={() => {}}>
          <Box
            display="flex"
            gap={2}
            justifyContent="center"
            flexWrap="wrap"
            alignItems="flex-start"
          >
            <TextFieldElement
              label="Amount"
              name="amount"
              required
              type="number"
              inputProps={{
                min: 10 ** -(tokenData?.decimals ?? 18),
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{ fontSize: "0.7rem" }}
                      onClick={handleMaxStake}
                    >
                      Max
                    </Button>
                  </InputAdornment>
                ),
              }}
              validation={{
                min: {
                  value: 10 ** -(tokenData?.decimals ?? 18),
                  message: "Amount must be greater than 0",
                },
                max: {
                  value: ethers.utils.formatUnits(
                    (type === "deposit"
                      ? tokenData?.balance
                      : stakingData?.amount) ?? 0,
                    tokenData?.decimals
                  ),
                  message: "Insufficient balance",
                },
              }}
            />
            <Button
              type="submit"
              variant="contained"
              sx={{ width: "110px", height: "56px" }}
            >
              {type === "deposit" ? "Deposit" : "Withdraw"}
            </Button>
          </Box>
        </FormContainer>

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
                    {stakingData?.duration?.div(86400)?.toString()} days{" "}
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
        {/* <p className="text-lg text-left">Contract: {stakingAddress}</p> */}
      </Stack>
    );
};

export default StakingForm;
