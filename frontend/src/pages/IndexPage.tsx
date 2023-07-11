import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import {
  Card,
  CardContent,
  CardMedia,
  Container,
  Divider,
} from "@mui/material";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";

const Index = () => {
  const { isConnected } = useAccount();
  return (
    <Box>
      <Typography variant="h5" textAlign="center" sx={{ letterSpacing: 1 }}>
        Welcome to the Web3 Developer Dashboard!
      </Typography>
      <Container maxWidth="lg" sx={{ display: "flex", mt: 5 }}>
        <Card
          sx={{
            border: "3px solid",
            borderColor: "primary.main",
            borderRadius: "20px",
          }}
        >
          <CardMedia sx={{ textAlign: "center" }}>
            <ImageOutlinedIcon
              sx={{
                fontSize: "300px",
                color: "grey.400",
              }}
            />
          </CardMedia>
          <CardContent sx={{ pt: 0 }}>
            <Typography variant="h5" sx={{ mb: 2, color: "primary.main" }}>
              NFT
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Mint your own NFT or a whole collection
            </Typography>
          </CardContent>
        </Card>
        {/* <Card>
          <CardMedia></CardMedia>
          <CardContent></CardContent>
        </Card> */}
      </Container>
      {/* <List disablePadding>
        {[
          "",
          "Create your own ERC-20 token",
          "Create a farming contract for your token",
        ].map((item, index) => (
          <ListItem key={index}>
            <ListItemText
              primary={"- " + item}
              primaryTypographyProps={{ variant: "body2" }}
            />
          </ListItem>
        ))}
      </List> */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          maxWidth: "max-content",
          gap: 3,
        }}
      >
        {!isConnected && <ConnectButton />}
      </Box>
    </Box>
  );
};
export default Index;
