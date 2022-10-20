import { useParams } from "react-router-dom";
import { useContractReads, useSigner, useAccount } from "wagmi";
import abi from "../utils/abi/ERC20.json";
import Title from "../utils/components/Title";

export default function TokenPage() {
  const { address: contractAddress } = useParams();
  const { data: signer } = useSigner();
  const { address } = useAccount();

  const contract = {
    addressOrName: contractAddress as string,
    contractInterface: abi,
  };
  const { data, isFetching } = useContractReads({
    contracts: [
      {
        ...contract,
        functionName: "name",
      },
      {
        ...contract,
        functionName: "symbol",
      },
      {
        ...contract,
        functionName: "balanceOf",
        args: [address],
      },
    ],
  });

  if (isFetching)
    return <h1 className="text-2xl font-bold text-center">Fetching data...</h1>;
  else
    return (
      <div>
        <Title text={"Token page"} />
        <div className="card text-lg">
          <h1 className="text-2xl">{data?.at(0)}</h1>
        </div>
      </div>
    );
}
