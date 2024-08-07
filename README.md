# Example App

A simple demonstration of an end to end application built on the Strobe protocol.

### Install Dependencies

To install dependencies for all apps and packages, run the following command:

```
pnpm install
```

### Build

To build all apps and packages, run the following command:

```
pnpm build
```

### Develop

To develop all apps and packages, add the following .env in `apps/example-app`

```
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=
NEXT_PUBLIC_SEPOLIA_RPC_URL=

NEXT_PUBLIC_STROBE_CORE_ADDRESS=0xCCaC6fB72b3E192350d6E9dEf97b2E7f78252E44

NEXT_PUBLIC_EXAMPLE_APP_ADDRESS=0x2Ee515869528C4f7d2a5a19666790d22c95F48EC.
NEXT_PUBLIC_ALWAYS_TRUE_VERIFIER_ADDRESS=0x65dBD55fb9FaB3740c6ab8C3cEf32Dc1dA71b562.
NEXT_PUBLIC_ALWAYS_TRUE_VERIFIER_CIRCUIT_HASH=ReplaceWithPinnedIPFSHash

NEXT_PUBLIC_ZKERC20_ADDRESS=0x4B40AED3f204E2Ce8Bb81e03C56622727d0053C3
NEXT_PUBLIC_420_VERIFIER_ADDRESS=0x9cA77b929Fdd9b38C8f201A490891f387eBf17e9
NEXT_PUBLIC_420_CIRCUIT_HASH=ReplaceWithPinnedIPFSHash
```

Then, run the following command:

```
pnpm dev
```

### Test

To test all apps and packages, run the following command:

```
pnpm test
```

### Lint

To lint all apps and packages, run the following command:

```
pnpm lint
```

### Deploying

To deploy contracts to sepolia, create the following .env in `packages/contracts`:

```
SEPOLIA_RPC_URL=
PRIVATE_KEY=
ETHERSCAN_API_KEY=

STROBE_CORE_ADDRESS=0xCCaC6fB72b3E192350d6E9dEf97b2E7f78252E44
```

Then, run the following command:

```
pnpm deploy:example-sepolia
```

### Deployed Contracts

* Example App: [0x2Ee515869528C4f7d2a5a19666790d22c95F48EC](https://sepolia.etherscan.io/address/0x2Ee515869528C4f7d2a5a19666790d22c95F48EC)
* Always True Verifier: [0x65dBD55fb9FaB3740c6ab8C3cEf32Dc1dA71b562](https://sepolia.etherscan.io/address/0x65dBD55fb9FaB3740c6ab8C3cEf32Dc1dA71b562)
* 420 Verifier: [0x9ca77b929fdd9b38c8f201a490891f387ebf17e9](https://sepolia.etherscan.io/address/0x9ca77b929fdd9b38c8f201a490891f387ebf17e9)
* ZKERC20: [0x4B40AED3f204E2Ce8Bb81e03C56622727d0053C3](https://sepolia.etherscan.io/address/0x4B40AED3f204E2Ce8Bb81e03C56622727d0053C3)