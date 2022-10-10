import { useEffect } from "react";
import { ConnectButton, useAccountModal } from "@rainbow-me/rainbowkit";
import { useAccount, useSwitchNetwork, useNetwork } from "wagmi";

export default function Wallet() {
  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();
  const { switchNetwork, isLoading } = useSwitchNetwork();

  useEffect(() => {
    if (chain?.id !== 5 && switchNetwork && isConnected) switchNetwork(5);
  }, [chain?.id, isLoading]);

  const style =
    "border rounded border-black w-max p-2 hover:bg-white duration-500 cursor-pointer";

  const shortAddress = () => {
    if (address) {
      return address.slice(0, 5) + "..." + address.slice(address.length - 4);
    }
  };

  const { openAccountModal } = useAccountModal();

  return (
    <div className="mb-6">
      {!isConnected ? (
        <ConnectButton />
      ) : (
        <p className={style} onClick={openAccountModal}>
          {shortAddress()}
        </p>
      )}
    </div>
  );
}
