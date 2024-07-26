export const exampleAppABI = [
    {
      "type": "constructor",
      "inputs": [
        {
          "name": "strobeCoreAddress",
          "type": "address",
          "internalType": "address"
        }
      ],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "onVerify",
      "inputs": [
        {
          "name": "success",
          "type": "bool",
          "internalType": "bool"
        },
        {
          "name": "requestId",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "requestProof",
      "inputs": [
        {
          "name": "verifierAddress",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "ipfsHash",
          "type": "string",
          "internalType": "string"
        }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "event",
      "name": "ProofRequested",
      "inputs": [
        {
          "name": "requestId",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "ProofVerified",
      "inputs": [
        {
          "name": "requestId",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        },
        {
          "name": "success",
          "type": "bool",
          "indexed": false,
          "internalType": "bool"
        }
      ],
      "anonymous": false
    }
  ];
  