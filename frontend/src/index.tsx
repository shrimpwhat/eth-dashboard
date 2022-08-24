import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { configureChains, chain, WagmiConfig, createClient } from "wagmi";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";

const { provider, webSocketProvider } = configureChains(
  [chain.goerli],
  [
    jsonRpcProvider({
      rpc: () => ({
        http: process.env.REACT_APP_RPC_URL ?? "",
      }),
    }),
  ]
);

const client = createClient({
  autoConnect: true,
  provider,
  webSocketProvider,
});

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <WagmiConfig client={client}>
      <App />
    </WagmiConfig>
  </React.StrictMode>
);
