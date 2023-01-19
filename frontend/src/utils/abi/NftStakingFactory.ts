export default [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "contractAddress",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "creatorAddress",
        type: "address",
      },
    ],
    name: "ContractCreated",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "collectionToStakingContract",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_nftCollection",
        type: "address",
      },
      {
        internalType: "address",
        name: "_rewardsToken",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_rewardsPerHour",
        type: "uint256",
      },
    ],
    name: "createStakingContract",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_address",
        type: "address",
      },
    ],
    name: "getUserContracts",
    outputs: [
      {
        internalType: "address[]",
        name: "contracts",
        type: "address[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;
