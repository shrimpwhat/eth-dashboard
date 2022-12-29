import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "@rainbow-me/rainbowkit/styles.css";
import "react-toastify/dist/ReactToastify.css";
import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { goerli, configureChains, createClient, WagmiConfig } from "wagmi";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { deepPurple } from "@mui/material/colors";
import { BrowserRouter } from "react-router-dom";

window.Buffer = window.Buffer || require("buffer").Buffer;

const { chains, provider } = configureChains(
  [goerli],
  [
    alchemyProvider({ apiKey: process.env.REACT_APP_ALCHEMY_KEY as string }),
    publicProvider(),
  ]
);

const { connectors } = getDefaultWallets({
  appName: "Web3 Dev Dashboard",
  chains,
});

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
