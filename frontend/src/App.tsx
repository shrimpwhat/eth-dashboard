import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import IndexPage from "./pages/IndexPage";
import NftMintPage from "./pages/NftMenu";
import { ToastContainer } from "react-toastify";
import CollectionPage from "./pages/CollectionPage";
import TokenPage from "./pages/TokenPage/TokenPage";
import TokenCreationPage from "./pages/TokenCreationPage";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import * as React from "react";

import useMediaQuery from "@mui/material/useMediaQuery";
import Box from "@mui/material/Box";
import ImageIcon from "@mui/icons-material/Image";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import Drawer from "@mui/material/Drawer";
import TollIcon from "@mui/icons-material/Toll";
import CssBaseline from "@mui/material/CssBaseline";
import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import HomeIcon from "@mui/icons-material/Home";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { styled, useTheme } from "@mui/material/styles";

function App() {
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.up("md"));
  const [open, setOpen] = React.useState(matches);
  const handleDrawerOpen = () => {
    setOpen(true);
  };
  const handleDrawerClose = () => {
    setOpen(false);
  };
  interface AppBarProps extends MuiAppBarProps {
    open?: boolean;
  }
  const drawerWidth = matches ? 300 : "auto";
  const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== "open",
  })<AppBarProps>(({ theme, open }) => ({
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.easeInOut,
      duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open &&
      matches && {
        width: `calc(100% - ${drawerWidth}px)`,
        marginLeft: `${drawerWidth}px`,
        transition: theme.transitions.create(["margin", "width"], {
          easing: theme.transitions.easing.easeOut,
          duration: theme.transitions.duration.enteringScreen,
        }),
      }),
  }));
  const DrawerHeader = styled("div")(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar,
    justifyContent: "flex-end",
  }));
  const Main = styled("main", {
    shouldForwardProp: (prop) => prop !== "open",
  })<{
    open?: boolean;
  }>(({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeInOut,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: `-${drawerWidth}px`,
    ...(open && {
      transition: theme.transitions.create("margin", {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    }),
  }));

  return (
    <Router>
      <Box sx={{ display: "flex" }}>
        <CssBaseline />
        <ToastContainer />

        <AppBar open={open}>
          <Toolbar sx={{}}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={handleDrawerOpen}
              edge="start"
              sx={{ mr: 2, ...(open && matches && { display: "none" }) }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" component="div">
              Web3 Dev Dashboard
            </Typography>
            {!matches && (
              <Box sx={{ ml: "auto" }}>
                <ConnectButton chainStatus="none" />
              </Box>
            )}
          </Toolbar>
        </AppBar>

        <Drawer
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
            },
          }}
          variant={matches ? "persistent" : "temporary"}
          anchor={matches ? "left" : "top"}
          open={open}
          onClose={() => setOpen(false)}
        >
          {matches && (
            <>
              <DrawerHeader>
                <ConnectButton chainStatus={"none"} />
                <IconButton onClick={handleDrawerClose}>
                  <ChevronLeftIcon />
                </IconButton>
              </DrawerHeader>
              <Divider />
            </>
          )}
          <List
            onClick={() => {
              if (!matches) setOpen(false);
            }}
          >
            {[
              ["Home", "/", <HomeIcon />],
              ["NFT", "/nft", <ImageIcon />],
              ["ERC20", "/token", <TollIcon />],
              ["DEX", "/", <SwapHorizIcon />],
            ].map((item, index) => (
              <ListItem key={index} disablePadding>
                <ListItemButton component={Link} to={item[1] as string}>
                  <ListItemIcon>{item[2]}</ListItemIcon>
                  <ListItemText primary={item[0]} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Drawer>

        <Main open={open}>
          <DrawerHeader />
          <Routes>
            <Route path="/" element={<IndexPage />} />
            <Route path="nft">
              <Route path="" element={<NftMintPage />} />
              <Route path=":address" element={<CollectionPage />} />
            </Route>
            <Route path="token">
              <Route path="" element={<TokenCreationPage />} />
              <Route path=":address" element={<TokenPage />} />
            </Route>
          </Routes>
        </Main>
      </Box>
    </Router>
  );
}

export default App;
