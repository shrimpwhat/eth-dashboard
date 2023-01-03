import { ethers, BigNumber } from "ethers";
import Input from "../../../utils/components/Input";
import { errorAlert, txAlert } from "../../../utils/components/Popups";
import { useRef, ChangeEvent, FormEvent, useContext } from "react";
import { useAddRecentTransaction } from "@rainbow-me/rainbowkit";
import { TokenContext } from "..";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import { FormContainer, TextFieldElement, useForm } from "react-hook-form-mui";
import InputAdornment from "@mui/material/InputAdornment";
import Button from "@mui/material/Button";

const BurnForm = () => {
  const addRecentTransaction = useAddRecentTransaction();

  const { token, tokenData, refetch } = useContext(TokenContext);
  const formContext = useForm<{ amount: string }>();

  const burnTokens = async (amount: BigNumber) => {
    const tx: ethers.ContractTransaction = await token?.burn(amount);
    addRecentTransaction({
      hash: tx.hash,
      description: `Burn ${ethers.utils.formatUnits(amount)} ${
        tokenData?.symbol
      }`,
    });
    await tx.wait();
    refetch();
    return tx.hash;
  };

  const handleBurn = ({ amount }: { amount: string }) => {
    txAlert(
      `Successfully burned ${amount} ${tokenData?.symbol}`,
      burnTokens(ethers.utils.parseEther(amount))
    );
  };

  return (
    <Box>
      <Divider sx={{ mb: 2 }} />
      <FormContainer formContext={formContext} onSuccess={handleBurn}>
        <Box
          display="flex"
          gap={2}
          justifyContent="center"
          alignItems="flex-start"
          flexWrap="wrap"
        >
          <TextFieldElement
            label="Burn amount"
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
            Burn
          </Button>
        </Box>
      </FormContainer>
    </Box>
  );
};

export default BurnForm;
