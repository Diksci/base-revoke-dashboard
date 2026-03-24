export const REVOKE_CONTRACT_ADDRESS = "0x01Ed17B60E5C34Dd0aC33c6CC8aaF6f855fd8551";

export const REVOKE_ABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "token", "type": "address" },
      { "internalType": "address", "name": "spender", "type": "address" }
    ],
    "name": "revoke",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;