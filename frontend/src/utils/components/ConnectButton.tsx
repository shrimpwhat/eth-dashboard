import { useConnect } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";

export default function ConnectButton({ style }: { style?: string }) {
  const { connect } = useConnect({
    connector: new InjectedConnector(),
    chainId: 5,
  });

  return (
    <div
      className={
        "mb-10 border rounded border-black w-max p-2 duration-500 cursor-pointer hover:bg-black hover:text-white " +
        style
      }
      onClick={() => {
        connect();
      }}
    >
      Connect wallet
    </div>
  );
}
