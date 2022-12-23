import FindContract from "../utils/components/FindContract";
import { useContract, useSigner } from "wagmi";
import TokenFactoryAbi from "../utils/abi/TokenFactory.json";
import { ethers } from "ethers";
import { deployedTokenAlert } from "../utils/components/Popups";
import { useAddRecentTransaction } from "@rainbow-me/rainbowkit";
import Box from "@mui/material/Box";
import { Typography } from "@mui/material";
import { FormContainer, TextFieldElement } from "react-hook-form-mui";
import FieldsWrapper from "../utils/components/FieldsWrapper";
import SubmitButton from "../utils/components/SubmitButton";

export default function TokenCreationPage() {
  const { data: signer } = useSigner();
  const addRecentTransaction = useAddRecentTransaction();

  const contract = useContract({
    address: process.env.REACT_APP_TOKEN_FACTORY as string,
    abi: TokenFactoryAbi,
    signerOrProvider: signer,
  });

  interface FormData {
    name: string;
    symbol: string;
    supply: string;
  }

  const createToken = async ({ name, symbol, supply }: FormData) => {
    const tx: ethers.ContractTransaction = await contract?.createToken(
      name,
      symbol,
      ethers.utils.parseEther(supply)
    );
    addRecentTransaction({
      hash: tx.hash,
      description: `Create token ${name}`,
    });
    const receipt = await tx.wait();
    const tokenAddress = receipt.events?.at(3)?.args?.tokenAddress;
    return tokenAddress;
  };

  const handleSubmit = async (data: FormData) => {
    deployedTokenAlert(createToken(data));
  };

  return (
    <Box>
      <Typography variant="h5" mb={4}>
        Create Token
      </Typography>
      <Box>
        <FindContract url="/token/" text={"Token address"} />
        <FormContainer onSuccess={handleSubmit}>
          <FieldsWrapper>
            <TextFieldElement label="Name" name="name" required fullWidth />
            <TextFieldElement label="Symbol" name="symbol" required fullWidth />
            <TextFieldElement
              label="Initial supply"
              name="supply"
              type="number"
              inputProps={{ step: 1e-18, min: 0 }}
              required
              fullWidth
            />
            <SubmitButton text="Create" />
          </FieldsWrapper>
        </FormContainer>
      </Box>
    </Box>
  );
}
