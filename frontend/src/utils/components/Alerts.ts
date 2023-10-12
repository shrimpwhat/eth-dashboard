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
