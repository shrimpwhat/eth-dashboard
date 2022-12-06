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
import Drawer from "@mui/material/Drawer";
import CssBaseline from "@mui/material/CssBaseline";
import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import InboxIcon from "@mui/icons-material/MoveToInbox";
import MailIcon from "@mui/icons-material/Mail";
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
    justifyContent: "space-between",
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
    <>
      <Box sx={{ display: "flex" }}>
        <CssBaseline />
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
            <Typography variant="h6" noWrap component="div">
              Persistent drawer
            </Typography>
            <Box sx={{ ml: "auto" }}>
              <ConnectButton chainStatus="none" />
            </Box>
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
                <IconButton onClick={handleDrawerClose}>
                  {theme.direction === "ltr" ? (
                    <ChevronLeftIcon />
                  ) : (
                    <ChevronRightIcon />
                  )}
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
            <ConnectButton />
            {["Inbox", "Starred", "Send email", "Drafts"].map((text, index) => (
              <ListItem key={text} disablePadding>
                <ListItemButton>
                  <ListItemIcon>
                    {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
                  </ListItemIcon>
                  <ListItemText primary={text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Drawer>
        <Main open={open}>
          <DrawerHeader />
          <Typography>123</Typography>
        </Main>
      </Box>
      <Router>
        <header></header>
        <main className="flex h-screen relative">
          <div className="bg-purple-200 w-40 fixed h-full md:w-60 p-5">
            <div className="mb-6"></div>
            <nav>
              <ul className="list-none">
                <li className="mb-5">
                  <Link to="/">Home</Link>
                </li>
                <li>
                  <Link to="/nft">Mint NFT</Link>
                </li>
                <li className="my-5">
                  <Link to="">NFT staking</Link>
                </li>
                <li>
                  <Link to="/token/create">ERC20</Link>
                </li>
                <li className="my-5">
                  <Link to="">Swap</Link>
                </li>
              </ul>
            </nav>
          </div>
          <div className="w-full pl-40 md:pl-60">
            <div className="w-full h-full p-5">
              <ToastContainer />
              <Routes>
                <Route path="/" element={<IndexPage />} />
                <Route path="nft">
                  <Route path="" element={<NftMintPage />} />
                  <Route
                    path="collection/:address"
                    element={<CollectionPage />}
                  />
                </Route>
                <Route path="token">
                  <Route path=":address" element={<TokenPage />} />
                  <Route path="create" element={<TokenCreationPage />} />
                </Route>
              </Routes>
            </div>
          </div>
        </main>
        <footer></footer>
      </Router>
    </>
  );
}

export default App;
