import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import { FormContainer, TextFieldElement } from "react-hook-form-mui";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme, styled } from "@mui/material/styles";

type FormProps = {
  address: string;
};

export default function FindContract({
  url,
  text,
}: {
  url: string;
  text: string;
}) {
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.up("sm"));
  const navigate = useNavigate();

  const handleSubmit = ({ address }: FormProps) => {
    navigate(url + address);
  };

  const Wrapper = styled(Container)(() => ({
    display: "flex",
    gap: 15,
    flexDirection: matches ? "row" : "column",
    alignItems: matches ? "normal" : "center",
  }));

  return (
    <FormContainer onSuccess={handleSubmit}>
      <Wrapper maxWidth="md">
        <TextFieldElement
          label={text}
          name="address"
          helperText="Find already deployed contract"
          parseError={() => "Not an ethereum address!"}
          fullWidth
          inputProps={{ sx: { height: "50px", boxSizing: "border-box" } }}
          validation={{ validate: (s) => ethers.utils.isAddress(s) }}
        />
        <Button
          variant="contained"
          type="submit"
          sx={{ height: "50px", width: "90px" }}
        >
          Find
        </Button>
      </Wrapper>
      <Divider sx={{ my: 5 }} />
    </FormContainer>
  );
}
