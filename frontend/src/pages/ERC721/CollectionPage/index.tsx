import { Box, Divider, Typography } from "@mui/material";
import MintForm from "./MintForm";
import StakingForm from "./StakingForm";

export default function CollectionPage() {
  return (
    <Box>
      <Typography variant="h5" mb={3}>
        NFT page
      </Typography>
      <MintForm />
      <Divider sx={{ my: 4 }} />
      <Typography variant="h5" mb={3}>
        NFT Staking
      </Typography>
      <StakingForm />
    </Box>
  );
}
