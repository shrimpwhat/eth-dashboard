import Button from "@mui/material/Button";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";

export default function SubmitButton({ text }: { text: string }) {
  const { isConnected } = useAccount();
  return (
    <>
      {isConnected ? (
        <Button variant="contained" type="submit">
          {text}
        </Button>
      ) : (
        <ConnectButton />
      )}
    </>
  );
}
