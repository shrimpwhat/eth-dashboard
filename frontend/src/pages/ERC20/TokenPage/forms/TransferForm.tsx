import { ethers, BigNumber } from "ethers";
import { txAlert } from "../../../../utils/components/Popups";
import { useContext } from "react";
import { useAddRecentTransaction } from "@rainbow-me/rainbowkit";
import { TokenContext } from "..";
import Divider from "@mui/material/Divider";
import Box from "@mui/material/Box";
import { FormContainer, TextFieldElement, useForm } from "react-hook-form-mui";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import MaxValueInput from "../../../../utils/components/MaxValueInput";
import { useNetwork } from "wagmi";

interface FormData {
  address: string;
  amount: string;
}

const TransferForm = () => {
  const addRecentTransaction = useAddRecentTransaction();
  const { token, tokenData, refetch } = useContext(TokenContext);
  const formContext = useForm<FormData>();
  const { chain } = useNetwork();
  const transferTokens = async (address: string, amount: BigNumber) => {
    const tx: ethers.ContractTransaction = await token?.transfer(
      address,
      amount
    );
    addRecentTransaction({
      hash: tx.hash,
      description: `Transfer ${ethers.utils.formatUnits(amount)} ${
        tokenData?.symbol
      }`,
    });
    await txAlert(
      `Successfully transfered ${amount} ${tokenData?.symbol}`,
      tx.wait(),
      chain?.blockExplorers?.default.url
    );
    refetch?.();
  };

  const handleTransfer = (data: FormData) => {
    transferTokens(data.address, ethers.utils.parseEther(data.amount));
  };

  return (
    <Box>
      <Divider sx={{ mb: 2 }} />
      <FormContainer formContext={formContext} onSuccess={handleTransfer}>
        <Grid container spacing={2} justifyContent="center">
          <Grid item xs={12} sm={6} md={5}>
            <TextFieldElement
              label="Transfer to"
              name="address"
              required
              fullWidth
              validation={{
                validate: (s) =>
                  ethers.utils.isAddress(s) ? true : "Not an ethereum address!",
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <MaxValueInput label="Amount" fullWidth />
          </Grid>
          <Grid item xs={12} sm="auto">
            <Button
              type="submit"
              variant="contained"
              sx={{ height: "56px", width: "100px" }}
            >
              Transfer
            </Button>
          </Grid>
        </Grid>
      </FormContainer>
    </Box>
  );
};
export default TransferForm;
