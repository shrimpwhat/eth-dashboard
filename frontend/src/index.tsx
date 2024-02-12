import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "@rainbow-me/rainbowkit/styles.css";
import "react-toastify/dist/ReactToastify.css";
import {
  RainbowKitProvider,
  connectorsForWallets,
} from "@rainbow-me/rainbowkit";
import { metaMaskWallet } from "@rainbow-me/rainbowkit/wallets";
import { configureChains, WagmiConfig, createClient } from "wagmi";
import {
  goerli,
  polygonMumbai,
  sepolia,
  bsc,
  polygon,
  arbitrum,
  optimism,
} from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { deepPurple } from "@mui/material/colors";
import { BrowserRouter } from "react-router-dom";

const { chains, provider } = configureChains(
  [goerli, polygonMumbai, sepolia, bsc, polygon, arbitrum, optimism],
  [publicProvider()]
);

const connectors = connectorsForWallets([
  {
    groupName: "Recommended",
    wallets: [metaMaskWallet({ chains })],
  },
]);

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
});

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

const theme = createTheme({
  palette: {
    primary: {
      main: deepPurple.A700,
    },
  },
  typography: {
    body2: {
      fontSize: 18,
    },
    h5: {
      fontWeight: 600,
      textAlign: "center",
    },
  },
});

root.render(
  <React.StrictMode>
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider
        chains={chains}
        initialChain={goerli}
        showRecentTransactions={true}
      >
        <ThemeProvider theme={theme}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </ThemeProvider>
      </RainbowKitProvider>
    </WagmiConfig>
  </React.StrictMode>
);
