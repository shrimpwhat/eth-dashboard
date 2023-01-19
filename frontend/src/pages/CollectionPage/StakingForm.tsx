import { useParams } from "react-router-dom";
import { useContractRead, useAccount } from "wagmi";
import Collection from "../../utils/abi/Collection";
import { ethers } from "ethers";
import NftStakingABI from "../../utils/abi/NftStaking";
import NftStakingFactoryABI from "../../utils/abi/NftStakingFactory";
import { Box, Button, Typography } from "@mui/material";

const factory = process.env.REACT_APP_NFT_STAKING_FACTORY;

export default function StakingForm() {
  const { address: contractAddress } = useParams<{ address: `0x${string}` }>();
  const { address } = useAccount();

  const { data: nftStakingAddress } = useContractRead({
    address: factory,
    abi: NftStakingFactoryABI,
    functionName: "collectionToStakingContract",
    args: [contractAddress ?? ethers.constants.AddressZero],
  });

  const { data: balance } = useContractRead({
    address: contractAddress,
    abi: Collection,
    functionName: "tokensOfOwner",
    args: [address ?? ethers.constants.AddressZero],
  });

  if (nftStakingAddress === ethers.constants.AddressZero) {
    return (
      <Box>
        <Typography>Staking contract hasn't been setup yet</Typography>
        <Button variant="outlined">Setup</Button>
      </Box>
    );
  } else return <></>;
}
