import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { ReactNode } from "react";
import { ethers } from "ethers";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

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
      draggable: true,
    }
  );
};

export const deployedCollectionAlert = (fn: Promise<string>) => {
  basePromisePopup(fn, (data: string) => (
    <Box>
      <Typography>
        Collection deployed at address:
        <br />
        <Typography sx={{}} className="text-xs break-all text-black">
          {data}
        </Typography>
        <br />
        Go{" "}
        <Link
          to={"/nft/collection/" + data}
          className="text-blue-600 underline"
        >
          here
        </Link>{" "}
        to mint some nfts
      </Typography>
    </Box>
  ));
};

export const deployedTokenAlert = (fn: Promise<string>) => {
  basePromisePopup(fn, (data: string) => (
    <div>
      <p>
        Token deployed at address:
        <br />
        <span className="text-xs break-all text-black">{data}</span>
        <br />
        <Link to={"/token/" + data} className="text-blue-600 underline">
          Token Page
        </Link>
      </p>
    </div>
  ));
};

export const txAlert = (text: string, fn: Promise<any>) => {
  basePromisePopup(fn, (data: string) => (
    <div>
      <p>{text}</p>
      <a
        target="_blank"
        rel="noreferrer"
        href={`https://goerli.etherscan.io/tx/${data}`}
        className="text-blue-600 underline"
      >
        View on Etherscan
      </a>
    </div>
  ));
};

export const nftMintAlert = (fn: Promise<ethers.ContractReceipt>) => {
  basePromisePopup(fn, (data: ethers.ContractReceipt) => (
    <div>
      <p>Nft successfuly minted! Check it at Opensea:</p>
      <ul>
        {data?.events?.map((event: ethers.Event, index: number) => (
          <li key={index}>
            <a
              target="_blank"
              rel="noreferrer"
              href={`https://testnets.opensea.io/assets/goerli/${data?.to}/${event?.args?.tokenId}`}
              className="text-blue-600 underline"
            >
              Link
            </a>
          </li>
        ))}
      </ul>
    </div>
  ));
};

export const ipfsAlert = async (fn: Promise<string>) => {
  return await toast.promise(fn, {
    pending: "Pining to ipfs...",
    error: {
      render({ data }: any) {
        return (
          <Typography sx={{ wordBreak: "break-all" }}>
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
