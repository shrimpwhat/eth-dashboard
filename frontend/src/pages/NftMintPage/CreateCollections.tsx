import CollectionFactoryInterface from "../../utils/abi/CollectionFactory";
import { useSigner, useContract, useAccount, useNetwork } from "wagmi";
import {
  errorAlert,
  deployedCollectionAlert,
  ipfsAlert,
} from "../../utils/components/Popups";
import { BigNumber, ethers } from "ethers";
import NodeFormData from "form-data";
import axios from "axios";
import { useAddRecentTransaction } from "@rainbow-me/rainbowkit";

import { FormContainer, TextFieldElement } from "react-hook-form-mui";
import FieldsWrapper from "../../utils/components/FieldsWrapper";
import SubmitButton from "../../utils/components/SubmitButton";
import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { ChangeEvent, useState } from "react";
import Typography from "@mui/material/Typography";

const contractAddress = process.env.REACT_APP_NFT_FACTORY_ADDRESS as string;
const PINATA_JWT = process.env.REACT_APP_PINATA_JWT_KEY;

interface FormData {
  name: string;
  symbol: string;
  price: string;
  limit: string;
  supply: string;
  uri?: string;
  metadata?: string;
}

interface ContractArgs {
  name: string;
  symbol: string;
  limit: BigNumber;
  supply: BigNumber;
  price: BigNumber;
  uri: string;
}

const CreateCollection = () => {
  const { isConnected } = useAccount();
  const { data: signer } = useSigner();
  const { chain } = useNetwork();

  const contract = useContract({
    address: contractAddress,
    abi: CollectionFactoryInterface,
    signerOrProvider: signer,
  });
  const addRecentTransaction = useAddRecentTransaction();

  const [active, setActive] = useState(0);
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setActive(newValue);
  };

  const [folder, setFolder] = useState<FileList | null>(null);
  const changeFolder = (e: ChangeEvent<HTMLInputElement>) => {
    setFolder(e.target.files);
  };

  const createMediaFormData = (files: FileList) => {
    const formData = new NodeFormData();
    Array.from(files).forEach((file) => {
      formData.append("file", file);
    });
    return formData;
  };

  const getFile = (
    file: File,
    index: number,
    ipfsHash: string,
    collectionName: string
  ) => {
    return new Blob(
      [
        JSON.stringify({
          name: `${collectionName} #${index + 1}`,
          image: `ipfs://${ipfsHash}/${file.name}`,
        }),
      ],
      {
        type: "application/json",
      }
    );
  };

  const createJSONFormData = (
    ipfsHash: string,
    files: FileList,
    collectionName: string
  ) => {
    const formData = new NodeFormData();
    Array.from(files).forEach((file, index) => {
      formData.append(
        "file",
        getFile(file, index, ipfsHash, collectionName),
        `files/${index.toString()}`
      );
    });
    return formData;
  };

  const pinFolderToIPFS = async (formData: NodeFormData) => {
    const { data } = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      formData,
      {
        maxBodyLength: Infinity,
        headers: {
          "Content-Type": `multipart/form-data; boundary=${formData?.getBoundary}`,
          Authorization: `Bearer ${PINATA_JWT}`,
        },
      }
    );
    return data.IpfsHash;
  };

  const getMetadataURI = async (data: FormData) => {
    const mediaHash = await pinFolderToIPFS(
      createMediaFormData(folder as FileList)
    );
    const jsonIpfsHash = await pinFolderToIPFS(
      createJSONFormData(mediaHash, folder as FileList, data.name)
    );
    return `ipfs://${jsonIpfsHash}/`;
  };

  const processData = async (data: FormData): Promise<ContractArgs> => {
    if (data.uri) {
      if (data?.uri?.[data?.uri?.length - 1] !== "/") data.uri += "/";
    } else if (data.metadata) data.uri = await ipfsAlert(getMetadataURI(data));
    const contractData: ContractArgs = {
      ...data,
      limit: BigNumber.from(data.limit),
      supply: BigNumber.from(data.supply),
      price: ethers.utils.parseEther(data.price),
      uri: data.uri as string,
    };
    return contractData;
  };

  const writeContract = async (data: ContractArgs) => {
    const tx = await contract?.createCollection(
      data.name,
      data.symbol,
      data.limit,
      data.supply,
      data.price,
      data.uri
    );
    const receipt = await tx?.wait();
    addRecentTransaction({
      hash: tx?.hash ?? ethers.constants.HashZero,
      description: `Create collection ${data.name}`,
    });
    return receipt?.events?.[2]?.args?.collectionAddress;
  };

  const createCollection = async (data: FormData) => {
    const args = await processData(data);
    deployedCollectionAlert(writeContract(args));
  };

  const handleSubmit = async (data: FormData) => {
    if (!isConnected)
      errorAlert("Connect your wallet first!", "wallet-connect");
    else if (Number(data.supply) < Number(data.limit))
      errorAlert(
        "Collection supply can't be lower than the user limit",
        "insufficient-supply"
      );
    else createCollection(data);
  };

  return (
    <FormContainer onSuccess={handleSubmit}>
      <FieldsWrapper>
        <TextFieldElement name="name" label="Name" required fullWidth />
        <TextFieldElement name="symbol" label="Symbol" required fullWidth />
        <TextFieldElement
          name="price"
          label={`Token price (in ${chain?.nativeCurrency?.symbol})`}
          required
          fullWidth
          type="number"
          inputProps={{ step: 1e-18, min: 0 }}
          validation={{
            min: { value: 0, message: "Must be greater or equal 0" },
          }}
        />
        <TextFieldElement
          name="limit"
          label="User limit"
          type="number"
          inputProps={{ min: 1 }}
          validation={{ min: { value: 1, message: "Must be greater than 0" } }}
          required
          fullWidth
        />
        <TextFieldElement
          name="supply"
          label="Max supply"
          type="number"
          inputProps={{ min: 1 }}
          validation={{ min: { value: 1, message: "Must be greater than 0" } }}
          required
          fullWidth
        />
        <Box>
          <Tabs value={active} onChange={handleChange} centered>
            <Tab label="Provide URL" />
            <Tab label="Upload media files" />
          </Tabs>
        </Box>
        {active === 0 ? (
          <TextFieldElement
            name="uri"
            label="Base metadata URI"
            required
            fullWidth
            type="url"
            validation={{
              pattern: {
                value: /^(ipfs:\/\/[a-zA-Z0-9]{46}|https:\/\/.+)\/?$/,
                message: "Please provide a valid IPFS or HTTPS URI",
              },
            }}
          />
        ) : (
          <Box width="100%">
            <Typography
              textAlign="center"
              gutterBottom
              variant="subtitle2"
              fontWeight="bold"
              color="primary.dark"
            >
              Please, upload only nfts' content like images, videos, gifs, etc.
              JSON metadata will be generated automatically.
            </Typography>
            <TextFieldElement
              name="metadata"
              fullWidth
              label="Metadata"
              required
              type="file"
              inputProps={{
                directory: "",
                webkitdirectory: "",
                onChange: changeFolder,
              }}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Box>
        )}
        <SubmitButton text="Create" />
      </FieldsWrapper>
    </FormContainer>
  );
};

export default CreateCollection;
