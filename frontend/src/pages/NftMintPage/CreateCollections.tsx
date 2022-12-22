import CollectionFactoryInterface from "../../utils/abi/CollectionFactory.json";
import { useSigner, useContract, useAccount } from "wagmi";
import {
  errorAlert,
  deployedCollectionAlert,
} from "../../utils/components/Popups";
import { ethers } from "ethers";
import { useAddRecentTransaction } from "@rainbow-me/rainbowkit";

import { FormContainer, TextFieldElement } from "react-hook-form-mui";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";

const contractAddress = process.env.REACT_APP_NFT_FACTORY_ADDRESS as string;

const CreateCollection = () => {
  const { isConnected } = useAccount();
  const { data: signer } = useSigner();
  const contract = useContract({
    address: contractAddress,
    abi: CollectionFactoryInterface,
    signerOrProvider: signer,
  });
  const addRecentTransaction = useAddRecentTransaction();

  interface FormData {
    name: string;
    symbol: string;
    price: string;
    limit: string;
    supply: string;
    uri: string;
  }

  const createCollection = async (data: FormData) => {
    if (data.uri[data.uri.length - 1] !== "/") data.uri += "/";
    const tx: ethers.ContractTransaction = await contract?.createCollection(
      data.name,
      data.symbol,
      data.limit,
      data.supply,
      ethers.utils.parseUnits(data.price),
      data.uri
    );
    addRecentTransaction({
      hash: tx.hash,
      description: `Create collection ${data.name}`,
    });
    const txReceipt = await tx.wait();
    if (txReceipt.events) return txReceipt.events[2].args?.collectionAddress;
    else throw new Error("No events have been emitted");
  };

  const handleSubmit = async (data: FormData) => {
    if (isConnected) {
      deployedCollectionAlert(createCollection(data));
    } else errorAlert("Connect your wallet first!", "wallet-connect");
  };

  return (
    <FormContainer onSuccess={handleSubmit}>
      <Container
        maxWidth="sm"
        sx={{
          display: "flex",
          alignItems: "center",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <TextFieldElement name="name" label="Name" required fullWidth />
        <TextFieldElement name="symbol" label="Symbol" required fullWidth />
        <TextFieldElement
          name="price"
          label="Token price (in ETH)"
          required
          fullWidth
          type="number"
          inputProps={{ step: 1e-18, min: 0 }}
        />
        <TextFieldElement
          name="limit"
          label="User limit"
          type="number"
          inputProps={{ min: 0 }}
          required
          fullWidth
        />
        <TextFieldElement
          name="supply"
          label="Max supply"
          type="number"
          inputProps={{ min: 0 }}
          required
          fullWidth
        />
        <TextFieldElement
          name="uri"
          label="Base metadata URI"
          required
          fullWidth
          type="url"
          validation={{
            pattern: {
              value: /^ipfs:\/\/[a-zA-Z0-9]{46}\/?$/,
              message: "Please provide a valid IPFS URI",
            },
          }}
        />
        <Button type="submit" variant="contained">
          Submit
        </Button>
      </Container>
    </FormContainer>
  );
};

export default CreateCollection;
