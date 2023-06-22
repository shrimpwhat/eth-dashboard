import FindContract from "../../../utils/components/FindContract";
import { useState } from "react";
import MintSingleNft from "./SingleMint";
import CreateCollection from "./CreateCollections";
import { useNavigate } from "react-router-dom";

import Typography from "@mui/material/Typography";
import ButtonGroup from "@mui/material/ButtonGroup";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";

export default function NftMintPage() {
  const [activeButton, setActiveButton] = useState(1);
  const navigate = useNavigate();

  return (
    <Box>
      <FindContract
        text={"Collection address"}
        onSuccess={({ address }) => navigate(`/nft/${address}`)}
      />
      <Typography variant="h5" mb={4}>
        Mint NFT
      </Typography>
      <Container
        maxWidth="xs"
        sx={{ display: "flex", justifyContent: "center", mb: 6 }}
      >
        <ButtonGroup>
          <Button
            onClick={() => {
              setActiveButton(1);
            }}
            sx={{ maxwidth: "190px", width: "100%" }}
            variant={activeButton === 1 ? "contained" : "outlined"}
          >
            Mint one nft
          </Button>
          <Button
            onClick={() => {
              setActiveButton(2);
            }}
            sx={{ maxwidth: "190px", width: "100%" }}
            variant={activeButton === 2 ? "contained" : "outlined"}
          >
            Create collection
          </Button>
        </ButtonGroup>
      </Container>
      <Box>{activeButton === 1 ? <MintSingleNft /> : <CreateCollection />}</Box>
    </Box>
  );
}
