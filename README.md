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
NEXT_PUBLIC_STROBE_CORE_ADDRESS="0xB3E387886b0Bf305d166470F032e3ED89CD95F96"
NEXT_PUBLIC_EXAMPLE_APP_ADDRESS="0xa9cC78168465a4d2893f8ef237320a90E2f859f8"
NEXT_PUBLIC_VERIFIER_ADDRESS="0x2bf1b0C60d36cd0Ab014c5B169f18b1Ec85889F2"
NEXT_PUBLIC_CIRCUIT_HASH="ReplaceWithPinnedIPFSHash"
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
```

Then, run the following command:

```
pnpm deploy:example-sepolia
```

### Deployed Contracts

* ExampleApp.sol: [0xa9cC78168465a4d2893f8ef237320a90E2f859f8](https://sepolia.etherscan.io/address/0xa9cC78168465a4d2893f8ef237320a90E2f859f8)
* AlwaysTrueVerifier.sol: [0x2bf1b0C60d36cd0Ab014c5B169f18b1Ec85889F2](https://sepolia.etherscan.io/address/0x2bf1b0C60d36cd0Ab014c5B169f18b1Ec85889F2)