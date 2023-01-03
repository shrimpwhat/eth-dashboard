import { ethers, BigNumber } from "ethers";
import Input from "../../../utils/components/Input";
import { errorAlert, txAlert } from "../../../utils/components/Popups";
import { useRef, ChangeEvent, FormEvent, useContext } from "react";
import { useAddRecentTransaction } from "@rainbow-me/rainbowkit";
import { TokenContext } from "..";
import Divider from "@mui/material/Divider";
import Box from "@mui/material/Box";
import { FormContainer, TextFieldElement, useForm } from "react-hook-form-mui";
import Button from "@mui/material/Button";
import InputAdornment from "@mui/material/InputAdornment";

interface FormData {
  address: string;
  amount: string;
}

const TransferForm = () => {
  const addRecentTransaction = useAddRecentTransaction();

  const { token, tokenData, refetch } = useContext(TokenContext);
  const formContext = useForm<FormData>();

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
    await tx.wait();
    refetch?.();
    return tx.hash;
  };

  const handleTransfer = (data: FormData) => {
    txAlert(
      `Successfully transfered ${data.amount} ${tokenData?.symbol}`,
      transferTokens(data.address, ethers.utils.parseEther(data.amount))
    );
  };

  return (
    <Box>
      <Divider sx={{ mb: 2 }} />
      <FormContainer formContext={formContext} onSuccess={handleTransfer}>
        <Box
          display="flex"
          gap={2}
          justifyContent="center"
          alignItems="flex-start"
          flexWrap="wrap"
        >
          <TextFieldElement
            label="Transfer to"
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
            label="Transfer amount"
            name="amount"
            type="number"
            inputProps={{
              min: 1e-18,
              step: 1e-18,
            }}
            validation={{
              min: { value: 1e-18, message: "Must be greater than 0" },
              max: {
                value: ethers.utils.formatUnits(
                  tokenData?.balance ?? 0,
                  tokenData?.decimals
                ),
                message: "Insufficient balance",
              },
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
                        ethers.utils.formatUnits(
                          tokenData?.balance ?? 0,
                          tokenData?.decimals
                        )
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
            Transfer
          </Button>
        </Box>
      </FormContainer>
    </Box>
  );
};
export default TransferForm;
