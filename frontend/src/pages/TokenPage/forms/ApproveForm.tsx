import { ethers, BigNumber } from "ethers";
import { txAlert } from "../../../utils/components/Popups";
import { useContext } from "react";
import { useAddRecentTransaction } from "@rainbow-me/rainbowkit";
import { TokenContext } from "..";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import { FormContainer, TextFieldElement, useForm } from "react-hook-form-mui";
import InputAdornment from "@mui/material/InputAdornment";
import Button from "@mui/material/Button";

interface FormData {
  address: string;
  amount: string;
}

const ApproveForm = () => {
  const addRecentTransaction = useAddRecentTransaction();

  const { token, tokenData, refetch } = useContext(TokenContext);
  const formContext = useForm<FormData>();

  const approveTokens = async (address: string, amount: BigNumber) => {
    const tx: ethers.ContractTransaction = await token?.approve(
      address,
      amount
    );
    addRecentTransaction({
      hash: tx.hash,
      description: `Approve ${tokenData?.symbol}`,
    });
    await tx.wait();
    refetch();
    return tx.hash;
  };

  const handleApprove = (data: FormData) => {
    txAlert(
      `Successfully approved ${tokenData?.symbol}`,
      approveTokens(data.address, ethers.utils.parseEther(data.amount))
    );
  };

  return (
    <Box>
      <Divider sx={{ mb: 2 }} />
      <FormContainer formContext={formContext} onSuccess={handleApprove}>
        <Box
          display="flex"
          gap={2}
          justifyContent="center"
          alignItems="flex-start"
          flexWrap="wrap"
        >
          <TextFieldElement
            label="Approve to"
            name="address"
            required
            validation={{
              validate: (s) =>
                ethers.utils.isAddress(s) ? true : "Not an ethereum address!",
            }}
            sx={{ width: "35%" }}
          />
          <TextFieldElement
            sx={{ width: "30%" }}
            label="Approve amount"
            name="amount"
            type="number"
            inputProps={{
              min: 0,
              step: 1e-18,
            }}
            validation={{
              min: { value: 0, message: "Must be greater or equal 0" },
            }}
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Button
                    variant="outlined"
                    size="small"
                    sx={{ fontSize: "0.7rem" }}
                    onClick={() => {
                      formContext.setValue(
                        "amount",
                        ethers.utils.formatEther(ethers.constants.MaxUint256)
                      );
                      formContext.trigger("amount");
                    }}
                  >
                    Max
                  </Button>
                </InputAdornment>
              ),
            }}
          />
          <Button type="submit" variant="contained" sx={{ height: "56px" }}>
            Approve
          </Button>
        </Box>
      </FormContainer>
    </Box>
  );
};

export default ApproveForm;
