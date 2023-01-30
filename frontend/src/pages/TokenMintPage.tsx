import FindContract from "../utils/components/FindContract";
import { useContract, useSigner } from "wagmi";
import TokenFactoryAbi from "../utils/abi/TokenFactory";
import { ethers } from "ethers";
import { deployedTokenAlert } from "../utils/components/Popups";
import { useAddRecentTransaction } from "@rainbow-me/rainbowkit";
import Box from "@mui/material/Box";
import { Typography } from "@mui/material";
import { FormContainer, TextFieldElement } from "react-hook-form-mui";
import FieldsWrapper from "../utils/components/FieldsWrapper";
import SubmitButton from "../utils/components/SubmitButton";

const ERC20_FACTORY_ADDRESS = process.env.REACT_APP_ERC20_FACTORY as string;

export default function TokenCreationPage() {
  const { data: signer } = useSigner();
  const addRecentTransaction = useAddRecentTransaction();

  const contract = useContract({
    address: ERC20_FACTORY_ADDRESS,
    abi: TokenFactoryAbi,
    signerOrProvider: signer,
  });

  interface FormData {
    name: string;
    symbol: string;
    supply: string;
  }

  const createToken = async ({ name, symbol, supply }: FormData) => {
    const tx = await contract?.createToken(
      name,
      symbol,
      ethers.utils.parseEther(supply)
    );
    if (tx) {
      addRecentTransaction({
        hash: tx?.hash ?? ethers.constants.HashZero,
        description: `Create token ${name}`,
      });
      deployedTokenAlert(
        tx.wait().then((receipt) => receipt?.events?.at(3)?.args?.tokenAddress)
      );
    }
  };

  return (
    <Box>
      <Typography variant="h5" mb={4}>
        Create Token
      </Typography>
      <Box>
        <FindContract url="/token/" text={"Token address"} />
        <FormContainer onSuccess={createToken}>
          <FieldsWrapper>
            <TextFieldElement label="Name" name="name" required fullWidth />
            <TextFieldElement label="Symbol" name="symbol" required fullWidth />
            <TextFieldElement
              label="Initial supply"
              name="supply"
              type="number"
              inputProps={{ min: 0 }}
              validation={{
                min: { value: 0, message: "Must be greater or equal 0" },
              }}
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
