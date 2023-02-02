import { ethers } from "ethers";
import { FormContainer, TextFieldElement } from "react-hook-form-mui";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme, styled } from "@mui/material/styles";

export default function FindContract({
  text,
  onSuccess,
}: {
  text: string;
  onSuccess: ({ address }: { address: string }) => void;
}) {
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.up("sm"));

  const Wrapper = styled(Container)(() => ({
    display: "flex",
    gap: 15,
    flexDirection: matches ? "row" : "column",
    alignItems: matches ? "normal" : "center",
  }));

  return (
    <FormContainer onSuccess={onSuccess}>
      <Wrapper maxWidth="md">
        <TextFieldElement
          label={text}
          name="address"
          helperText="Find already deployed contract"
          fullWidth
          validation={{
            validate: (s) =>
              ethers.utils.isAddress(s) ? true : "Not an ethereum address!",
          }}
        />
        <Button
          variant="contained"
          type="submit"
          sx={{ height: "56px", width: "90px" }}
        >
          Find
        </Button>
      </Wrapper>
      <Divider sx={{ my: 5 }} />
    </FormContainer>
  );
}
