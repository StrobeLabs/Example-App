export const strobeCoreABI = [
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "requestId",
                "type": "uint256",
                "indexed": false
            },
            {
                "internalType": "string",
                "name": "ipfsHash",
                "type": "string",
                "indexed": false
            }
        ],
        "type": "event",
        "name": "ProofRequested",
        "anonymous": false
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "requestId",
                "type": "uint256",
                "indexed": false
            },
            {
                "internalType": "bool",
                "name": "success",
                "type": "bool",
                "indexed": false
            }
        ],
        "type": "event",
        "name": "ProofSubmitted",
        "anonymous": false
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "callbackAddress",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "verifierAddress",
                "type": "address"
            },
            {
                "internalType": "string",
                "name": "ipfsHash",
                "type": "string"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function",
        "name": "requestProof",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ]
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "verifierAddress",
                "type": "address"
            },
            {
                "internalType": "bytes",
                "name": "proof",
                "type": "bytes"
            },
            {
                "internalType": "bytes",
                "name": "proofInputs",
                "type": "bytes"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function",
        "name": "submitProof",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ]
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "requestId",
                "type": "uint256"
            },
            {
                "internalType": "bytes",
                "name": "proof",
                "type": "bytes"
            },
            {
                "internalType": "bytes",
                "name": "proofInputs",
                "type": "bytes"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function",
        "name": "submitProofById"
    }
]