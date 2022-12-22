import { ConnectButton } from "@rainbow-me/rainbowkit";
import NftMinterInterface from "../../utils/abi/NftMinter.json";
import { useSigner, useContract, useAccount } from "wagmi";
import { ChangeEvent, useEffect, useState } from "react";
import { nftMintAlert, ipfsAlert } from "../../utils/components/Popups";
import { useAddRecentTransaction } from "@rainbow-me/rainbowkit";
import NodeFormData from "form-data";
import axios from "axios";

import {
  FormContainer,
  TextFieldElement,
  useForm,
  useWatch,
} from "react-hook-form-mui";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import Divider from "@mui/material/Divider";

interface FormProps {
  name: string;
  description: string;
  image: string;
}

const PINATA_JWT = process.env.REACT_APP_PINATA_JWT_KEY;

const MintSingleNft = () => {
  const { isConnected } = useAccount();
  const { data: signer } = useSigner();
  const contract = useContract({
    address: process.env.REACT_APP_NFT_MINTER_ADDRESS as string,
    abi: NftMinterInterface,
    signerOrProvider: signer,
  });
  const addRecentTransaction = useAddRecentTransaction();
  const context = useForm<FormProps>();
  const name = useWatch({ control: context.control, name: "name" });
  const description = useWatch({
    control: context.control,
    name: "description",
  });

  const [image, setImage] = useState<File | undefined>();
  const changeImage = (e: ChangeEvent<HTMLInputElement>) => {
    setImage(e.target.files?.[0]);
  };
  const [imageSrc, readImage] = useState("/no-image.png");

  const uploadImage = async () => {
    const formData = new NodeFormData();
    formData.append("file", image);
    const response = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      formData,
      {
        headers: {
          "Content-Type": `multipart/form-data; boundary=${formData.getBoundary}`,
          Authorization: `Bearer ${process.env.REACT_APP_PINATA_JWT_KEY}`,
        },
      }
    );
    const { IpfsHash } = response.data;
    return IpfsHash;
  };

  const uploadMetadata = async (
    name: string,
    description: string,
    imageHash: string
  ): Promise<string> => {
    const data = JSON.stringify({
      pinataContent: {
        name,
        image: "ipfs://" + imageHash,
        ...(description && { description }),
      },
    });
    const response = await axios.post(
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      data,
      {
        headers: {
          Authorization: `Bearer ${PINATA_JWT}`,
          "Content-Type": "application/json",
        },
      }
    );
    const { IpfsHash } = response.data;
    return IpfsHash;
  };

  const getMetadata = async ({ name, description }: FormProps) => {
    const imageHash = await uploadImage();
    const metadata = await uploadMetadata(name, description, imageHash);
    return metadata;
  };

  const sendTx = async (metadata: string) => {
    const tx = await contract?.mint("ipfs://" + metadata);
    addRecentTransaction({
      hash: tx.hash,
      description: "Mint single nft",
    });
    const receipt = await tx.wait();
    return receipt;
  };

  const mint = async (formData: FormProps) => {
    const metadata = await ipfsAlert(getMetadata(formData));
    nftMintAlert(sendTx(metadata));
  };

  useEffect(() => {
    if (image) {
      const reader = new FileReader();
      reader.readAsDataURL(image);
      reader.onload = (e) => {
        readImage((e.target?.result as string) ?? "/no-image.png");
      };
    }
  }, [image]);

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        gap: 6,
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      <FormContainer onSuccess={mint} formContext={context}>
        <Container
          sx={{
            display: "flex",
            alignItems: "center",
            flexDirection: "column",
            gap: 3,
          }}
          maxWidth="xs"
        >
          <TextFieldElement label="Name" name="name" required fullWidth />
          <TextFieldElement label="Description" name="description" fullWidth />
          <TextFieldElement
            type="file"
            name="image"
            label="Image"
            InputLabelProps={{
              shrink: true,
            }}
            onChange={changeImage}
            required
            fullWidth
          />
          {isConnected ? (
            <Button variant="contained" type="submit">
              Mint
            </Button>
          ) : (
            <ConnectButton />
          )}
        </Container>
      </FormContainer>
      <NftPreview name={name} description={description} image={imageSrc} />
    </Box>
  );
};

const NftPreview = ({
  name,
  description,
  image,
}: {
  name?: string;
  description?: string;
  image?: string;
}) => {
  return (
    <Card sx={{ maxWidth: 380 }} elevation={12}>
      <CardMedia
        component="img"
        sx={{ maxHeight: 380, objectFit: "contain" }}
        image={image}
        alt="nft image"
      />
      <Divider />
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          {name ? name : "Nft name"}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description
            ? description
            : "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Quo possimus eos eius commodi illo nemo repudiandae facere aliquam quos explicabo? Cum aliquam molestias at sit nesciunt, accusamus voluptatem suscipit odio."}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default MintSingleNft;
