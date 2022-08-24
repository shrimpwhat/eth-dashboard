import { toast } from "react-toastify";
import { Link } from "react-router-dom";

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

export const deployedCollectionAlert = (fn: Promise<any>) => {
  toast.promise(
    fn,
    {
      pending: "Waiting for transaction...",
      success: {
        render({ data }) {
          return (
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
          );
        },
      },
      error: {
        render({ data }) {
          return data.message;
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
