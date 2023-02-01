import { toast } from "react-toastify";
import { Link as RouterLink } from "react-router-dom";
import { ReactNode } from "react";
import { ethers } from "ethers";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import { ListItemButton } from "@mui/material";

const Address = ({ data }: { data: string }) => {
  return (
    <Typography
      sx={{ wordBreak: "break-all", color: "black" }}
      variant="body1"
      component="span"
    >
      {data}
    </Typography>
  );
};

export const errorAlert = (msg: string, id: string) => {
  toast.error(msg, {
    position: "top-right",
    hideProgressBar: false,
    closeOnClick: true,
    autoClose: 10000,
    pauseOnHover: true,
    draggable: true,
    toastId: id,
  });
};

const basePromisePopup = (
  fn: Promise<any>,
  renderFn: (data: any) => ReactNode
) => {
  return toast.promise(
    fn,
    {
      pending: "Waiting for transaction...",
      success: {
        render({ data }) {
          return renderFn(data);
        },
      },
      error: {
        render({ data }: any) {
          return (
            <Typography sx={{ wordBreak: "break-all" }}>
              {data.message}
            </Typography>
          );
        },
        closeOnClick: true,
      },
    },
    {
      position: "top-right",
      hideProgressBar: false,
      closeOnClick: false,
      autoClose: 10000,
      draggable: false,
    }
  );
};

export const deployedCollectionAlert = (fn: Promise<string>) => {
  basePromisePopup(fn, (data: string) => (
    <Box>
      <Typography>
        Collection deployed at address:
        <br />
        <Address data={data} />
        <br />
        <Link component={RouterLink} to={"/nft/" + data}>
          Go here
        </Link>{" "}
        to mint some nfts
      </Typography>
    </Box>
  ));
};

export const deployedTokenAlert = (fn: Promise<string>) => {
  return basePromisePopup(fn, (data: string) => (
    <Box>
      <Typography>
        Token deployed at address:
        <br />
        <Address data={data} />
        <br />
        <Link to={"/token/" + data} component={RouterLink}>
          Token Page
        </Link>
      </Typography>
    </Box>
  ));
};

export const txAlert = (
  text: string,
  fn: Promise<ethers.ContractReceipt>,
  explorer?: string
) => {
  return basePromisePopup(fn, (data: ethers.ContractReceipt) => (
    <Box>
      <Typography variant="body2">{text}</Typography>
      <Link
        target="_blank"
        rel="noreferrer"
        href={`${explorer}/tx/${data.transactionHash}`}
      >
        View on Explorer
      </Link>
    </Box>
  ));
};

export const nftMintAlert = (fn: Promise<ethers.ContractReceipt>) => {
  return basePromisePopup(fn, (data: ethers.ContractReceipt) => (
    <Box>
      <Typography variant="body2">
        Nft successfuly minted! Check it at Opensea:
      </Typography>
      <List>
        {data?.events?.map((event: ethers.Event, index: number) => (
          <ListItem key={index} disablePadding>
            <ListItemButton
              component={Link}
              target="_blank"
              rel="noreferrer"
              href={`https://testnets.opensea.io/assets/goerli/${data?.to}/${event?.args?.tokenId}`}
              sx={{ color: "primary.main" }}
            >
              {`Token #${event?.args?.tokenId}`}
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  ));
};

export const ipfsAlert = async (fn: Promise<any>) => {
  return await toast.promise(fn, {
    pending: "Pining to ipfs...",
    error: {
      render({ data }: any) {
        return (
          <Typography variant="body2" sx={{ wordBreak: "break-all" }}>
            {data.message}
          </Typography>
        );
      },
      autoClose: 10000,
      closeOnClick: true,
      draggable: true,
    },
  });
};
