import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { Card, CardContent, CardMedia, Container, Link } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import MonetizationOnOutlinedIcon from "@mui/icons-material/MonetizationOnOutlined";
import { deepPurple } from "@mui/material/colors";

const Index = () => {
  const links = [
    {
      route: "/nft",
      title: "NFT",
      description: "Mint your own NFT or a whole collection",
      icon: (
        <ImageOutlinedIcon
          sx={{
            fontSize: "200px",
            color: deepPurple[200],
          }}
        />
      ),
    },
    {
      route: "/token",
      title: "Fungible tokens",
      description: "Create new ERC20 token",
      icon: (
        <MonetizationOnOutlinedIcon
          sx={{ fontSize: "200px", color: deepPurple[200] }}
        />
      ),
    },
  ];

  return (
    <Box>
      <Container
        maxWidth="lg"
        sx={{
          display: "flex",
          mt: 5,
          flexWrap: "wrap",
          gap: 5,
          justifyContent: "center",
        }}
      >
        {links.map((item, index) => (
          <Link
            component={RouterLink}
            to={item.route}
            underline="none"
            key={index}
          >
            <Card
              sx={{
                border: "2px solid",
                borderColor: "primary.main",
                borderRadius: "10px",
                p: 1,
                width: { xs: "300px", md: "400px" },
                minHeight: "365px",
              }}
              className="IndexPage_navigation_card"
            >
              <CardMedia sx={{ textAlign: "center" }}>{item.icon}</CardMedia>
              <CardContent sx={{ pt: 0 }}>
                <Typography variant="h5" sx={{ mb: 2, color: "primary.main" }}>
                  {item.title}
                </Typography>
                <Typography
                  fontWeight={500}
                  textAlign={"center"}
                  fontSize="1.3rem"
                >
                  {item.description}
                </Typography>
              </CardContent>
            </Card>
          </Link>
        ))}
      </Container>
    </Box>
  );
};
export default Index;
