import { Routes, Route, Link } from "react-router-dom";
import IndexPage from "./pages/IndexPage";
import NftMintPage from "./pages/NftMintPage";
import { ToastContainer } from "react-toastify";
import CollectionPage from "./pages/CollectionPage";
import TokenPage from "./pages/TokenPage";
import TokenCreationPage from "./pages/TokenMintPage";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import * as React from "react";

import useMediaQuery from "@mui/material/useMediaQuery";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import CssBaseline from "@mui/material/CssBaseline";
import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import { styled, useTheme } from "@mui/material/styles";

import HomeIcon from "@mui/icons-material/Home";
import ListItemIcon from "@mui/material/ListItemIcon";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import TollIcon from "@mui/icons-material/Toll";
import ImageIcon from "@mui/icons-material/Image";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";

const App = () => {
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
    justifyContent: "space-between",
  }));
  // const Main = styled("main", {
  //   shouldForwardProp: (prop) => prop !== "open",
  // })<{
  //   open?: boolean;
  // }>(({ theme, open }) => ({
  //   flexGrow: 1,
  //   padding: theme.spacing(3),
  //   transition: theme.transitions.create("margin", {
  //     easing: theme.transitions.easing.easeInOut,
  //     duration: theme.transitions.duration.leavingScreen,
  //   }),
  //   marginLeft: `-${drawerWidth}px`,
  //   ...(open && {
  //     transition: theme.transitions.create("margin", {
  //       easing: theme.transitions.easing.easeOut,
  //       duration: theme.transitions.duration.enteringScreen,
  //     }),
  //     marginLeft: 0,
  //   }),
  // }));

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <ToastContainer />

      <AppBar open={open}>
        <Toolbar>
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
        PaperProps={{
          sx: {
            bgcolor: "grey.100",
            color: "primary.main",
          },
        }}
      >
        {matches && (
          <>
            <DrawerHeader>
              <Box sx={{ mx: "auto" }}>
                <ConnectButton />
              </Box>
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
            ["Home", "/", <HomeIcon color="primary" />],
            ["NFT", "/nft", <ImageIcon color="primary" />],
            ["ERC20", "/token", <TollIcon color="primary" />],
            ["DEX", "/", <SwapHorizIcon color="primary" />],
          ].map((item, index) => (
            <ListItem key={index}>
              <ListItemButton component={Link} to={item[1] as string}>
                <ListItemIcon>{item[2]}</ListItemIcon>
                <ListItemText
                  primary={item[0]}
                  primaryTypographyProps={{ sx: { fontWeight: 700 } }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>

      <Box
        component={"main"}
        sx={{
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
        }}
      >
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
      </Box>
    </Box>
  );
};

export default App;
