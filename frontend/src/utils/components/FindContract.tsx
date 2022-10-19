import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import { errorAlert } from "./Popups";

export default function FindContract({
  url,
  text,
}: {
  url: string;
  text: string;
}) {
  const address = useRef("");
  const navigate = useNavigate();

  return (
    <>
      <div className="flex items-stretch mt-10 w-2/3 mx-auto flex-wrap justify-center box-border">
        <input
          id="find-address"
          className="border border-black p-1 grow"
          placeholder={text}
          onChange={(e) => {
            address.current = e.target.value;
          }}
        />
        <button
          className="ml-3 py-1 px-3 submit-button"
          onClick={() => {
            if (ethers.utils.isAddress(address.current))
              navigate(url + address.current);
            else errorAlert("Not an ethereum address!", "invalid-address");
          }}
        >
          Find
        </button>
      </div>
      <hr className="my-12" />
    </>
  );
}
