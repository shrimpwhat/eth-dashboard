import { ethers } from "ethers";
import { useContext } from "react";
import { useContractRead, useAccount, useToken } from "wagmi";
import { TokenContext } from "../TokenPage";
import erc20StakingFactoryAbi from "../../../utils/abi/ERC20StakingFactory";
import Input from "../../../utils/components/Input";

const StakingForm = () => {
  const { token, tokenData, refetch } = useContext(TokenContext);

  const { address } = useAccount();

  const { data: stakingAddress } = useContractRead({
    address: process.env.REACT_APP_ERC20_STAKING_FACTORY,
    abi: erc20StakingFactoryAbi,
    functionName: "tokenStakings",
    args: [address ?? ethers.constants.AddressZero],
  });

  const setupStakingContract = async () => {};

  if (stakingAddress === ethers.constants.AddressZero) {
    if (address !== tokenData?.owner) return null;
    else
      return (
        <>
          <hr className="mt-8 mb-5" />
          <h2 className="font-bold mb-3">Staking</h2>
          <div>
            <p className="inline-block mr-4">
              Staking contract hasn't been setup yet
            </p>
            <button className="submit-button">Setup</button>
          </div>
        </>
      );
  } else return <></>;
};

export default StakingForm;
