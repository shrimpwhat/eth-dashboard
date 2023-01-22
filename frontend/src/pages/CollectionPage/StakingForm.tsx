import { useParams } from "react-router-dom";
import { ethers } from "ethers";
import {
  useContractRead,
  useAccount,
  useContract,
  useSigner,
  useContractReads,
  useContractInfiniteReads,
  paginatedIndexesConfig,
} from "wagmi";
import Collection from "../../utils/abi/Collection";
import NftStakingABI from "../../utils/abi/NftStaking";
import NftStakingFactoryABI from "../../utils/abi/NftStakingFactory";
import { Box, Button, Typography } from "@mui/material";
import { useAddRecentTransaction } from "@rainbow-me/rainbowkit";
import { FormContainer, TextFieldElement } from "react-hook-form-mui";
import FieldsWrapper from "../../utils/components/FieldsWrapper";
import { txAlert } from "../../utils/components/Popups";
import SubmitButton from "../../utils/components/SubmitButton";

const factoryAddress = process.env.REACT_APP_NFT_STAKING_FACTORY;

interface SetupProps {
  token: `0x${string}`;
  rewards: string;
}

export default function StakingForm() {
  const { address: contractAddress } = useParams<{ address: `0x${string}` }>();
  const { data: signer } = useSigner();
  const addRecentTransaction = useAddRecentTransaction();

  const { data: nftStakingAddress, refetch: refetchStakingAddress } =
    useContractRead({
      address: factoryAddress,
      abi: NftStakingFactoryABI,
      functionName: "collectionToStakingContract",
      args: [contractAddress ?? ethers.constants.AddressZero],
    });

  const { data: collectionName } = useContractRead({
    address: contractAddress,
    abi: Collection,
    functionName: "name",
  });

  const factory = useContract({
    address: factoryAddress,
    abi: NftStakingFactoryABI,
    signerOrProvider: signer,
  });

  const setupStaking = async ({ token, rewards }: SetupProps) => {
    const tx = await factory?.createStakingContract(
      contractAddress ?? ethers.constants.AddressZero,
      token,
      ethers.utils.parseEther(rewards)
    );
    if (tx) {
      addRecentTransaction({
        hash: tx.hash,
        description: `Setup staking contract for ${collectionName}`,
      });
      await txAlert("Staking successfully setup!", tx.wait());
      refetchStakingAddress();
    }
  };

  if (nftStakingAddress === ethers.constants.AddressZero) {
    return (
      <Box textAlign="center">
        <Typography variant="h6" gutterBottom>
          Staking contract hasn't been setup yet
        </Typography>
        <FormContainer onSuccess={setupStaking}>
          <FieldsWrapper>
            <TextFieldElement
              name="token"
              label="Reward token conrtact"
              fullWidth
              validation={{
                validate: (s) =>
                  ethers.utils.isAddress(s) ? true : "Not an ethereum address!",
              }}
              required
            />
            <TextFieldElement
              name="rewards"
              label="Reward rate per day"
              type="number"
              inputProps={{ min: 1e-18 }}
              validation={{ min: 1e-18 }}
              fullWidth
              required
            />
            <SubmitButton text="Setup" />
          </FieldsWrapper>
        </FormContainer>
      </Box>
    );
  } else return <OwnedNFTs contractAddress={contractAddress} />;
}

const OwnedNFTs = ({
  contractAddress,
}: {
  contractAddress?: `0x${string}`;
}) => {
  const { address } = useAccount();
  const { data: tokens } = useContractRead({
    address: contractAddress,
    abi: Collection,
    functionName: "tokensOfOwner",
    args: [address ?? ethers.constants.AddressZero],
    watch: true,
  });

  // const {data} = useContractInfiniteReads({
  //   cacheKey: 'ownedNFT',
  //   ...paginatedIndexesConfig(
  //     (index) => {
  //       return {

  //       }
  //     },

  //   )
  //   })
  return <p>{tokens?.length}</p>;
};
