import React from "react";
import ReactDOM from "react-dom/client";
import "./index.scss";
import App from "./App";
import "@rainbow-me/rainbowkit/styles.css";
import "react-toastify/dist/ReactToastify.css";
import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { chain, configureChains, createClient, WagmiConfig } from "wagmi";
import { infuraProvider } from "wagmi/providers/infura";
import { publicProvider } from "wagmi/providers/public";

const { chains, provider } = configureChains(
  [chain.hardhat, chain.goerli],
  [
    infuraProvider({ apiKey: process.env.REACT_APP_INFURA_KEY }),
    publicProvider(),
  ]
);

const { connectors } = getDefaultWallets({
  appName: "Ethereum Dashboard",
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

root.render(
  <React.StrictMode>
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider
        chains={chains}
        // initialChain={chain.goerli}
        showRecentTransactions={true}
      >
        <App />
      </RainbowKitProvider>
    </WagmiConfig>
  </React.StrictMode>
);
