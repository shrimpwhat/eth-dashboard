import { useEffect } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useSwitchNetwork, useNetwork } from "wagmi";

export default function Wallet() {
  const { isConnected } = useAccount();
  const { chain } = useNetwork();
  const { switchNetwork, isLoading } = useSwitchNetwork();

  useEffect(() => {
    if (chain?.id !== 5 && switchNetwork && isConnected) switchNetwork(5);
  }, [chain?.id, isLoading]);

  return (
    <div className="mb-6">
      <ConnectButton />
    </div>
  );
}
