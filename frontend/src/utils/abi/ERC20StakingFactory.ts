export default [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "poolAddress",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "creatorAddress",
        type: "address",
      },
    ],
    name: "PoolCreated",
    type: "event",
  },
  {
    inputs: [
      { internalType: "address", name: "_token", type: "address" },
      { internalType: "uint256", name: "_duration", type: "uint256" },
    ],
    name: "createPool",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_address", type: "address" }],
    name: "getUserPools",
    outputs: [{ internalType: "address[]", name: "pools", type: "address[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "tokenStakings",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
] as const;
