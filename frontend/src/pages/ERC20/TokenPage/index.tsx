import { ethers, BigNumber, BigNumberish } from "ethers";
import { useParams } from "react-router-dom";
import {
  useToken,
  useAccount,
  useContract,
  useSigner,
  useContractReads,
} from "wagmi";
import abi from "../../../utils/abi/ERC20";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { createContext } from "react";
import { TransferForm, MintForm, ApproveForm, BurnForm } from "./forms";
import floatValue from "../../../utils/components/FloatValue";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";

interface TokenProps {
  address?: string;
  decimals?: number;
  name?: string;
  symbol?: string;
  owner?: string;
  totalSupply?: {
    formatted: string;
    value: BigNumber;
  };
  balance: BigNumberish;
}

interface TokenContextInterface {
  token: ethers.Contract | null;
  tokenData?: TokenProps;
  refetch: Function;
}

const TokenContext = createContext<TokenContextInterface>({
  token: null,
  refetch: () => {},
});
export { TokenContext };

export default function TokenPage() {
  const { address: contractAddress } = useParams();
  const { address } = useAccount();
  const { data: signer } = useSigner();

  const contract = {
    address: contractAddress as string,
    abi,
  };
  const token = useContract({
    ...contract,
    signerOrProvider: signer,
  });

  const { data: readData, refetch } = useContractReads({
    contracts: [
      {
        ...contract,
        functionName: "balanceOf",
        args: [address ?? ethers.constants.AddressZero],
      },
      {
        ...contract,
        functionName: "owner",
      },
    ],
  });

  const tokenInfo = useToken({ address: contractAddress as `0x${string}` });

  if (tokenInfo.isFetching && !tokenInfo.isFetchedAfterMount)
    return (
      <Box>
        <Typography variant="h5" gutterBottom>
          Token Page
        </Typography>
        <Typography variant="h5" sx={{ mt: "35vh" }}>
          Fetching data
          <CircularProgress size="30px" sx={{ ml: 2 }} />
        </Typography>
      </Box>
    );
  else
    return (
      <Box>
        <Typography variant="h5" sx={{ mb: "25px" }}>
          Token Page
        </Typography>
        <Container
          sx={{ border: "2px solid black", p: 2, borderRadius: "10px" }}
          maxWidth="md"
        >
          <Stack textAlign="center" gap={2}>
            <Typography variant="h4">{tokenInfo.data?.name}</Typography>
            {address ? (
              <>
                <Typography variant="h6">
                  Balance:{" "}
                  <Box
                    component="span"
                    color="primary.main"
                    fontWeight="bold"
                    fontStyle="italic"
                  >
                    {`${floatValue(
                      ethers.utils.formatEther(readData?.at(0) ?? 0),
                      5
                    )} ${tokenInfo.data?.symbol}`}
                  </Box>
                </Typography>
                <TokenContext.Provider
                  value={{
                    token,
                    tokenData: {
                      balance: readData?.at(0) ?? 0,
                      owner: readData?.at(1) as string,
                      ...tokenInfo?.data,
                    },
                    refetch,
                  }}
                >
                  <MintForm />
                  <TransferForm />
                  <ApproveForm />
                  <BurnForm />
                </TokenContext.Provider>
              </>
            ) : (
              <Box mx="auto">
                <ConnectButton />
              </Box>
            )}
          </Stack>
        </Container>
      </Box>
    );
}
