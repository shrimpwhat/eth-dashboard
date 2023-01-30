import { ethers, BigNumber } from "ethers";
import { txAlert } from "../../../utils/components/Popups";
import { useContext } from "react";
import { useAddRecentTransaction } from "@rainbow-me/rainbowkit";
import { TokenContext } from "..";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import { FormContainer, TextFieldElement } from "react-hook-form-mui";
import Button from "@mui/material/Button";
import MaxValueInput from "../../../utils/components/MaxValueInput";
import Grid from "@mui/material/Grid";

interface FormData {
  address: string;
  amount: string;
}

const ApproveForm = () => {
  const addRecentTransaction = useAddRecentTransaction();

  const { token, tokenData, refetch } = useContext(TokenContext);

  const approveTokens = async (address: string, amount: BigNumber) => {
    const tx: ethers.ContractTransaction = await token?.approve(
      address,
      amount
    );
    addRecentTransaction({
      hash: tx.hash,
      description: `Approve ${tokenData?.symbol}`,
    });
    await txAlert(`Successfully approved ${tokenData?.symbol}`, tx.wait());
    refetch();
  };

  const handleApprove = (data: FormData) => {
    approveTokens(data.address, ethers.utils.parseEther(data.amount));
  };

  return (
    <Box>
      <Divider sx={{ mb: 2 }} />
      <FormContainer onSuccess={handleApprove}>
        <Grid container spacing={2} justifyContent="center">
          <Grid item xs={12} sm={6} md={5}>
            <TextFieldElement
              label="Approve to"
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
            <MaxValueInput
              label="Amount"
              minZero
              fullWidth
              maxValue={ethers.utils.formatEther(ethers.constants.MaxUint256)}
            />
          </Grid>
          <Grid item xs={12} sm="auto">
            <Button
              type="submit"
              variant="contained"
              sx={{ height: "56px", width: "100px" }}
            >
              Approve
            </Button>
          </Grid>
        </Grid>
      </FormContainer>
    </Box>
  );
};

export default ApproveForm;
