import { ethers, BigNumber } from "ethers";
import { useAccount } from "wagmi";
import { txAlert } from "../../../utils/components/Popups";
import { useContext } from "react";
import { useAddRecentTransaction } from "@rainbow-me/rainbowkit";
import { TokenContext } from "..";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import { FormContainer, TextFieldElement, useForm } from "react-hook-form-mui";
import Button from "@mui/material/Button";
import { InputAdornment } from "@mui/material";

interface FormData {
  address: string;
  amount: string;
}

const MintForm = () => {
  const { address } = useAccount();
  const { token, tokenData, refetch } = useContext(TokenContext);
  const addRecentTransaction = useAddRecentTransaction();
  const formContext = useForm<FormData>();

  const mintTokens = async (address: string, amount: BigNumber) => {
    const tx: ethers.ContractTransaction = await token?.mintTo(address, amount);
    addRecentTransaction({
      hash: tx.hash,
      description: `Mint ${ethers.utils.formatUnits(amount)} ${
        tokenData?.symbol
      }`,
    });
    await tx.wait();
    refetch?.();
    return tx.hash;
  };

  const handleMint = (data: FormData) => {
    txAlert(
      `Successfully minted ${data.amount} ${tokenData?.symbol}`,
      mintTokens(data.address, ethers.utils.parseEther(data.amount))
    );
  };

  if (tokenData?.owner !== address) return null;
  else
    return (
      <Box>
        <Divider sx={{ mb: 2 }} />
        <FormContainer formContext={formContext} onSuccess={handleMint}>
          <Box
            display="flex"
            gap={2}
            justifyContent="center"
            alignItems="flex-start"
            flexWrap="wrap"
          >
            <TextFieldElement
              label="Mint to"
              name="address"
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
                          "address",
                          address ?? ethers.constants.AddressZero
                        );
                        formContext.trigger("address");
                      }}
                    >
                      Current
                    </Button>
                  </InputAdornment>
                ),
              }}
              validation={{
                validate: (s) =>
                  ethers.utils.isAddress(s) ? true : "Not an ethereum address!",
              }}
            />
            <TextFieldElement
              label="Mint amount"
              name="amount"
              type="number"
              required
              inputMode="decimal"
              validation={{
                min: { value: 1e-18, message: "Must be greater than 0" },
              }}
              inputProps={{ step: 1e-18, min: 1e-18 }}
            />
            <Button type="submit" variant="contained" sx={{ height: "56px" }}>
              Mint
            </Button>
          </Box>
        </FormContainer>
      </Box>
    );
};

export default MintForm;
