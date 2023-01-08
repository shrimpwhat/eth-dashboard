import { SxProps } from "@mui/material";
import Button from "@mui/material/Button";
import InputAdornment from "@mui/material/InputAdornment";
import { ethers } from "ethers";
import { useContext } from "react";
import { TextFieldElement, useFormContext } from "react-hook-form-mui";
import { TokenContext } from "../../pages/TokenPage";

export default function Input({
  label,
  fullWidth,
  maxValue,
  minZero,
  sx,
}: {
  label: string;
  fullWidth?: boolean;
  maxValue?: string;
  minZero?: boolean;
  sx?: SxProps;
}) {
  const { tokenData } = useContext(TokenContext);
  const { setValue, trigger } = useFormContext();

  const setMaxBalance = () => {
    setValue(
      "amount",
      maxValue ??
        ethers.utils.formatUnits(tokenData?.balance ?? 0, tokenData?.decimals)
    );
    trigger("amount");
  };

  return (
    <TextFieldElement
      sx={sx}
      label={label}
      name="amount"
      required
      fullWidth={fullWidth}
      type="number"
      inputProps={{
        min: minZero ? 0 : 1,
        max:
          maxValue ??
          ethers.utils.formatUnits(
            tokenData?.balance ?? 0,
            tokenData?.decimals
          ),
      }}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <Button
              variant="outlined"
              size="small"
              sx={{ fontSize: "0.7rem" }}
              onClick={setMaxBalance}
            >
              Max
            </Button>
          </InputAdornment>
        ),
      }}
      validation={{
        min: {
          value: minZero ? 0 : 10 ** -(tokenData?.decimals ?? 18),
          message: minZero
            ? "Amount must be greater or equal 0"
            : "Amount must be greater than 0",
        },
        max: {
          value:
            maxValue ??
            ethers.utils.formatUnits(
              tokenData?.balance ?? 0,
              tokenData?.decimals
            ),
          message: "Insufficient balance",
        },
      }}
    />
  );
}
