import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";

const Index = () => {
  const { isConnected } = useAccount();
  return (
    <Box>
      <Typography variant="h5" textAlign={{ xs: "center", md: "left" }}>
        Welcome to the Web3 Developer Dashboard! Here you can:
      </Typography>
      <List disablePadding>
        {[
          "Mint your own NFT or a whole collection",
          "Setup a staking contract for your collection with rewards in any token",
          "Create your own ERC-20 token",
          "Create a farming contract for your token",
          "Provide a liquidity to your tokens and make them available for swaps",
        ].map((item, index) => (
          <ListItem key={index}>
            <ListItemText
              primary={"- " + item}
              primaryTypographyProps={{ variant: "body2" }}
            />
          </ListItem>
        ))}
      </List>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          maxWidth: "max-content",
          gap: 3,
        }}
      >
        <Typography variant="h5" fontWeight={600} textAlign="center">
          Connect wallet and start creating!
        </Typography>
        {!isConnected && <ConnectButton />}
      </Box>
    </Box>
  );
};
export default Index;
