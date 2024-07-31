export const strobeCoreABI = [
    {
        "type": "function",
        "name": "_generateRequestId",
        "inputs": [
            {
                "name": "appAddress",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "verifierAddress",
                "type": "address",
                "internalType": "address"
            }
        ],
        "outputs": [
            {
                "name": "requestId",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "requestProof",
        "inputs": [
            {
                "name": "callbackAddress",
                "type": "address",
                "internalType": "address"
            },
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
        "outputs": [
            {
                "name": "requestId",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "requests",
        "inputs": [
            {
                "name": "",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "outputs": [
            {
                "name": "app",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "verifier",
                "type": "address",
                "internalType": "address"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "submitProof",
        "inputs": [
            {
                "name": "verifierAddress",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "proof",
                "type": "bytes",
                "internalType": "bytes"
            },
            {
                "name": "proofInputs",
                "type": "bytes",
                "internalType": "bytes"
            }
        ],
        "outputs": [
            {
                "name": "success",
                "type": "bool",
                "internalType": "bool"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "submitProofById",
        "inputs": [
            {
                "name": "requestId",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "proof",
                "type": "bytes",
                "internalType": "bytes"
            },
            {
                "name": "proofInputs",
                "type": "bytes",
                "internalType": "bytes"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "supportsInterface",
        "inputs": [
            {
                "name": "interfaceId",
                "type": "bytes4",
                "internalType": "bytes4"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "bool",
                "internalType": "bool"
            }
        ],
        "stateMutability": "view"
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
            },
            {
                "name": "ipfsHash",
                "type": "string",
                "indexed": false,
                "internalType": "string"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "ProofSubmitted",
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
]