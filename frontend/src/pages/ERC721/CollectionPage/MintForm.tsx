import {
  useContract,
  useSigner,
  useAccount,
  useNetwork,
  useBalance,
  useContractReads,
} from "wagmi";
import { nftMintAlert, txAlert } from "../../../utils/components/Popups";
import { ethers, BigNumber } from "ethers";
import { useAddRecentTransaction } from "@rainbow-me/rainbowkit";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import { FormContainer, TextFieldElement, useForm } from "react-hook-form-mui";
import Button from "@mui/material/Button";
import SubmitButton from "../../../utils/components/SubmitButton";
import FieldsWrapper from "../../../utils/components/FieldsWrapper";
import Divider from "@mui/material/Divider";
import Collection from "../../../utils/abi/Collection";
import { useParams } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";

export default function MintForm() {
  const { address: contractAddress } = useParams<{ address: `0x${string}` }>();
  const contractData = { address: contractAddress as string, abi: Collection };
  const { address } = useAccount();

  const {
    data: collectionInfo,
    isFetching,
    refetch: refetchCollection,
    isFetchedAfterMount,
  } = useContractReads({
    contracts: [
      {
        ...contractData,
        functionName: "name",
      },
      {
        ...contractData,
        functionName: "TOKEN_PRICE",
      },
      {
        ...contractData,
        functionName: "MAX_USER_LIMIT",
      },
      {
        ...contractData,
        functionName: "totalMinted",
      },
      {
        ...contractData,
        functionName: "MAX_SUPPLY",
      },
      {
        ...contractData,
        functionName: "numberMinted",
        args: [address ?? ethers.constants.AddressZero],
      },
      {
        ...contractData,
        functionName: "owner",
      },
      {
        ...contractData,
        functionName: "balanceOf",
        args: [address ?? ethers.constants.AddressZero],
      },
      {
        ...contractData,
        functionName: "tokensOfOwner",
        args: [address ?? ethers.constants.AddressZero],
      },
    ],
    select: (data) => {
      return {
        name: data[0],
        price: data[1],
        userLimit: Number(data[2]),
        totalMinted: Number(data[3]),
        maxSupply: Number(data[4]),
        userMintedAmount: Number(data[5]),
        owner: data[6],
        address: contractAddress,
      };
    },
  });
  const { data: signer } = useSigner();
  const { chain } = useNetwork();
  const contract = useContract({
    address: collectionInfo?.address,
    abi: Collection,
    signerOrProvider: signer,
  });
  const addRecentTransaction = useAddRecentTransaction();
  const formContext = useForm<{ amount: string }>();
  const { data: contractBalance, refetch: refetchBalance } = useBalance({
    address: collectionInfo?.address,
  });

  const checkAmount = (mintAmount: number) => {
    if (collectionInfo) {
      if (mintAmount > collectionInfo?.maxSupply - collectionInfo?.totalMinted)
        throw new Error("Not enough tokens left");
      else if (
        mintAmount >
        collectionInfo.userLimit - collectionInfo.userMintedAmount
      )
        throw new Error("Amount is greater than your limit");
    }
  };

  const mint = async ({ amount }: { amount: string }) => {
    const mintAmount = Number(amount);
    checkAmount(mintAmount);
    const tx = await contract?.mint(BigNumber.from(mintAmount), {
      value: collectionInfo?.price.mul(mintAmount),
    });
    if (tx) {
      addRecentTransaction({
        hash: tx.hash,
        description: `Mint ${mintAmount} tokens of ${collectionInfo?.name}`,
      });
      await nftMintAlert(tx?.wait());
      refetchCollection?.();
      refetchBalance();
    }
  };

  const withdraw = async () => {
    const tx = await contract?.withdraw();
    if (tx) {
      addRecentTransaction({
        hash: tx.hash,
        description: `Withdrawn mint costs from ${collectionInfo?.name}`,
      });

      await txAlert("Funds successfuly withdrawn!", tx.wait());
      refetchBalance();
    }
  };

  const setMaxAmount = () => {
    if (collectionInfo)
      formContext.setValue(
        "amount",
        Math.min(
          collectionInfo.userLimit - collectionInfo.userMintedAmount,
          collectionInfo.maxSupply - collectionInfo.totalMinted
        ).toString()
      );
  };
  if ((isFetching && !isFetchedAfterMount) || !collectionInfo)
    return (
      <Typography variant="h5" sx={{ my: "auto" }}>
        Fetching data
        <CircularProgress size="30px" sx={{ ml: 2 }} />
      </Typography>
    );
  else
    return (
      <Box>
        <Container maxWidth="sm" sx={{ border: "1px solid black", p: 2 }}>
          <Stack textAlign={"center"} gap={2}>
            <Typography variant="h4">{collectionInfo?.name}</Typography>
            <Box>
              <Chip
                label={`${
                  collectionInfo.maxSupply - collectionInfo.totalMinted
                }/${collectionInfo.maxSupply}`}
                color="primary"
                sx={{ fontWeight: "bold", fontSize: "1rem" }}
              />
            </Box>
            <Typography variant="h6">
              <Box component="span" color="#880e4f" fontWeight="bold">
                {ethers.utils.formatEther(collectionInfo.price ?? 0)}{" "}
                {chain?.nativeCurrency?.symbol}
              </Box>{" "}
              per token
            </Typography>
            {collectionInfo.userMintedAmount < collectionInfo.userLimit ? (
              <>
                <Typography variant="h6">
                  Your limit is
                  <Box
                    component="span"
                    fontStyle={"italic"}
                    fontWeight="bold"
                    color="#304ffe"
                  >
                    {" "}
                    {Math.min(
                      collectionInfo.userLimit -
                        collectionInfo.userMintedAmount,
                      collectionInfo.maxSupply - collectionInfo.totalMinted
                    )}{" "}
                  </Box>
                  more nfts
                </Typography>
                {collectionInfo.maxSupply - collectionInfo.totalMinted === 0 ? (
                  <Typography
                    variant="h6"
                    color="primary.main"
                    fontWeight="bold"
                  >
                    All tokens have been minted!
                  </Typography>
                ) : (
                  <FormContainer
                    formContext={formContext}
                    onSuccess={(data) => mint(data)}
                  >
                    <FieldsWrapper>
                      <Box display="flex" justifyContent="center" width="100%">
                        <TextFieldElement
                          label="Amount to mint"
                          name="amount"
                          type="number"
                          fullWidth
                          required
                          sx={{ minWidth: "110px" }}
                          validation={{
                            min: {
                              value: 1,
                              message: "Must be greater than 0",
                            },
                            max: {
                              value:
                                collectionInfo.userLimit -
                                collectionInfo.userMintedAmount,
                              message: "Greater than your limit!",
                            },
                          }}
                          inputProps={{
                            min: 1,
                            max:
                              collectionInfo.userLimit -
                              collectionInfo.userMintedAmount,
                          }}
                        />
                        <Button
                          variant="outlined"
                          onClick={setMaxAmount}
                          sx={{ height: "56px" }}
                        >
                          Max
                        </Button>
                      </Box>
                      <SubmitButton text="Mint" />
                    </FieldsWrapper>
                  </FormContainer>
                )}
              </>
            ) : (
              <Typography variant="h6" color="primary.main" fontWeight="bold">
                You have already minted max amount!
              </Typography>
            )}
            {collectionInfo.owner === address && (
              <>
                <Divider />
                <Typography variant="h6">
                  Contract balance:{" "}
                  <Box component="span" fontWeight="bold">
                    {contractBalance?.formatted} {contractBalance?.symbol}
                  </Box>
                </Typography>
                <Box>
                  <Button onClick={withdraw} variant="outlined">
                    Withdraw
                  </Button>
                </Box>
              </>
            )}
          </Stack>
        </Container>
      </Box>
    );
}
