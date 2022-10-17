import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { ReactNode } from "react";

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

const deployedContract = (
  fn: Promise<any>,
  renderFn: (data: any) => ReactNode
) => {
  toast.promise(
    fn,
    {
      pending: "Waiting for transaction...",
      success: {
        render({ data }) {
          return renderFn(data);
        },
      },
      error: {
        render({ data }) {
          return <p className="break-all">{data.message}</p>;
        },
      },
    },
    {
      position: "top-right",
      hideProgressBar: true,
      closeOnClick: false,
      autoClose: false,
      draggable: false,
    }
  );
};
export const deployedCollectionAlert = (fn: Promise<any>) => {
  deployedContract(fn, (data: any) => (
    <div>
      <p>
        Collection deployed at address:
        <br />
        <span className="text-xs break-all text-black">{data}</span>
        <br />
        Go{" "}
        <Link
          to={"/nft/collection/" + data}
          className="text-blue-600 underline"
        >
          here
        </Link>{" "}
        to mint some nfts
      </p>
    </div>
  ));
};

export const deployedTokenAlert = (fn: Promise<any>) => {
  deployedContract(fn, (data: any) => (
    <div>
      <p>
        Token deployed at address:
        <br />
        <span className="text-xs break-all text-black">{data}</span>
        <br />
        Go{" "}
        <Link
          to={"/nft/collection/" + data}
          className="text-blue-600 underline"
        >
          here
        </Link>{" "}
        to mint some nfts
      </p>
    </div>
  ));
};

export const nftMintAlert = (fn: Promise<any>) => {
  toast.promise(
    fn,
    {
      pending: "Waiting for transaction...",
      success: {
        render({ data }) {
          return (
            <div>
              <p>Nft successfuly minted! Check it at Opensea:</p>
              <ul>
                {data?.events?.map((event: any, index: number) => (
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
          );
        },
      },
      error: {
        render({ data }) {
          return <p className="break-all">{data.message}</p>;
        },
      },
    },
    {
      position: "top-right",
      hideProgressBar: true,
      closeOnClick: false,
      autoClose: false,
      draggable: true,
    }
  );
};

export const WithdrawalAlert = (fn: Promise<any>) => {
  toast.promise(
    fn,
    {
      pending: "Waiting for transaction...",
      success: {
        render({ data }) {
          return (
            <div>
              <p>Funds successfuly withdrawn!</p>

              <a
                target="_blank"
                rel="noreferrer"
                href={`https://goerli.etherscan.io/tx/${data}`}
                className="text-blue-600 underline"
              >
                Etherscan link
              </a>
            </div>
          );
        },
      },
      error: {
        render({ data }) {
          return <p className="break-all">{data.message}</p>;
        },
      },
    },
    {
      position: "top-right",
      hideProgressBar: false,
      closeOnClick: true,
      autoClose: 10000,
      draggable: true,
    }
  );
};
