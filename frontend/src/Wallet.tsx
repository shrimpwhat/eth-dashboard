import { useEffect } from "react";
import { useAccount, useSwitchNetwork, useNetwork } from "wagmi";
import ConnectButton from "./utils/components/ConnectButton";

export default function Wallet() {
  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork({
    chainId: 5,
  });

  useEffect(() => {
    if (chain?.id !== 5 && switchNetwork) {
      switchNetwork(5);
    }
  }, [chain]);

  const style =
    "mb-10 border rounded border-black w-max p-2 hover:bg-white duration-500";

  const shortAddress = () => {
    if (address) {
      return address.slice(0, 5) + "..." + address.slice(address.length - 4);
    }
  };

  return (
    <>
      {!isConnected ? (
        <ConnectButton style="hover:bg-white hover:text-black" />
      ) : (
        <p className={style}>{shortAddress()}</p>
      )}
    </>
  );
}
