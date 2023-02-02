import { useParams } from "react-router-dom";
import { ethers } from "ethers";
import { useContractRead, useAccount, useContract, useSigner } from "wagmi";
import { useState, useEffect } from "react";
import Collection from "../../../utils/abi/Collection";
import NftStakingABI from "../../../utils/abi/NftStaking";
import NftStakingFactoryABI from "../../../utils/abi/NftStakingFactory";
import { Box, Button, Typography } from "@mui/material";
import { useAddRecentTransaction } from "@rainbow-me/rainbowkit";
import { FormContainer, TextFieldElement } from "react-hook-form-mui";
import FieldsWrapper from "../../../utils/components/FieldsWrapper";
import { txAlert } from "../../../utils/components/Popups";
import SubmitButton from "../../../utils/components/SubmitButton";
import axios from "axios";

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

  const collectionContractData = {
    address: contractAddress,
    abi: Collection,
  };

  const { data: baseURI } = useContractRead({
    ...collectionContractData,
    functionName: "baseURI",
    select: (data) => {
      if (data.slice(0, 4) === "ipfs")
        data = `https://ipfs.io/ipfs/${data.slice(7)}`;
      return data;
    },
  });

  const { data: tokenIds } = useContractRead({
    ...collectionContractData,
    functionName: "tokensOfOwner",
    args: [address ?? ethers.constants.AddressZero],
    // watch: true,
  });

  // const [tokens, setTokens] = useState<{ name: string; image: string }[]>([]);
  // const [isFetching, setIsFetching] = useState(true);

  // useEffect(() => {
  //   if (tokenIds?.length && baseURI) {
  //     const fetchTokens = async () => {
  //       const tokens = [];
  //       for (const tokenId of tokenIds) {
  //         const { data } = await axios.get(`${baseURI}${tokenId}`);
  //         tokens.push(data);
  //       }
  //       setTokens(tokens);
  //       setIsFetching(false);
  //       console.log(tokens);
  //     };
  //     fetchTokens();
  //   }
  // }, [tokenIds?.length]);

  // const images = [
  //   "https://ipfs.io/ipfs/QmXSrtqdSS8bgbmYhghhtS1Mgo6CGVV6pYswoshfMhagAG/123.jpg",
  //   "https://ipfs.io/ipfs/QmXSrtqdSS8bgbmYhghhtS1Mgo6CGVV6pYswoshfMhagAG/73ho6zl4zyc.jpg",
  //   "https://ipfs.io/ipfs/QmXSrtqdSS8bgbmYhghhtS1Mgo6CGVV6pYswoshfMhagAG/7Gikd49bzRA.jpg",
  //   "https://ipfs.io/ipfs/QmXSrtqdSS8bgbmYhghhtS1Mgo6CGVV6pYswoshfMhagAG/96b7e445281a191b3922d814aae420ce.jpg",
  //   "https://ipfs.io/ipfs/QmXSrtqdSS8bgbmYhghhtS1Mgo6CGVV6pYswoshfMhagAG/Dao.jpg",
  //   "https://ipfs.io/ipfs/QmXSrtqdSS8bgbmYhghhtS1Mgo6CGVV6pYswoshfMhagAG/EfSDjJnP6oM.jpg",
  //   "https://ipfs.io/ipfs/QmXSrtqdSS8bgbmYhghhtS1Mgo6CGVV6pYswoshfMhagAG/HypeBears.jpg",
  //   "https://ipfs.io/ipfs/QmXSrtqdSS8bgbmYhghhtS1Mgo6CGVV6pYswoshfMhagAG/IoCGN_5fC70.jpg",
  //   "https://ipfs.io/ipfs/QmXSrtqdSS8bgbmYhghhtS1Mgo6CGVV6pYswoshfMhagAG/IolTVnG4GYM.jpg",
  //   "https://ipfs.io/ipfs/QmXSrtqdSS8bgbmYhghhtS1Mgo6CGVV6pYswoshfMhagAG/M6bulSLTABk.jpg",
  //   "https://ipfs.io/ipfs/QmXSrtqdSS8bgbmYhghhtS1Mgo6CGVV6pYswoshfMhagAG/Screenshot_3.jpg",
  //   "https://ipfs.io/ipfs/QmXSrtqdSS8bgbmYhghhtS1Mgo6CGVV6pYswoshfMhagAG/WDArBCihiA4.jpg",
  //   "https://ipfs.io/ipfs/QmXSrtqdSS8bgbmYhghhtS1Mgo6CGVV6pYswoshfMhagAG/WxBWWMmyGI2ZdQpuNOG0Gg3Z3gaqn3jm9JpGl7RWK2QBbcJL3daBxRCKnOONftiIaQxjL6Y-nEMBhrRLvK3u5Tv4.jpg",
  //   "https://ipfs.io/ipfs/QmXSrtqdSS8bgbmYhghhtS1Mgo6CGVV6pYswoshfMhagAG/ZgUYfjR_f9I.jpg",
  //   "https://ipfs.io/ipfs/QmXSrtqdSS8bgbmYhghhtS1Mgo6CGVV6pYswoshfMhagAG/artworks-000538677318-ge5qc6-t500x500.jpg",
  //   "https://ipfs.io/ipfs/QmXSrtqdSS8bgbmYhghhtS1Mgo6CGVV6pYswoshfMhagAG/bf793252b7cfc2e8103e83af462d8b42.1000x1000x1.jpg",
  //   "https://ipfs.io/ipfs/QmXSrtqdSS8bgbmYhghhtS1Mgo6CGVV6pYswoshfMhagAG/ea32f6c983edd27255ec982bb9f1fd53.jpg",
  //   "https://ipfs.io/ipfs/QmXSrtqdSS8bgbmYhghhtS1Mgo6CGVV6pYswoshfMhagAG/hgvOykEhLss.jpg",
  //   "https://ipfs.io/ipfs/QmXSrtqdSS8bgbmYhghhtS1Mgo6CGVV6pYswoshfMhagAG/hype1.jpg",
  //   "https://ipfs.io/ipfs/QmXSrtqdSS8bgbmYhghhtS1Mgo6CGVV6pYswoshfMhagAG/hype3.jpg",
  //   "https://ipfs.io/ipfs/QmXSrtqdSS8bgbmYhghhtS1Mgo6CGVV6pYswoshfMhagAG/i28pbOZL.jpg",
  //   "https://ipfs.io/ipfs/QmXSrtqdSS8bgbmYhghhtS1Mgo6CGVV6pYswoshfMhagAG/ic-IS90X2EY.jpg",
  //   "https://ipfs.io/ipfs/QmXSrtqdSS8bgbmYhghhtS1Mgo6CGVV6pYswoshfMhagAG/photo_2022-07-20_09-34-30.jpg",
  //   "https://ipfs.io/ipfs/QmXSrtqdSS8bgbmYhghhtS1Mgo6CGVV6pYswoshfMhagAG/photo_2022-09-09_10-10-34.jpg",
  //   "https://ipfs.io/ipfs/QmXSrtqdSS8bgbmYhghhtS1Mgo6CGVV6pYswoshfMhagAG/yrPts-KiI1Y.jpg",
  // ];

  return (
    <>
      {/* {images.map((image, index) => (
        <img src={image} key={index}></img>
      ))} */}
    </>
  );
};
