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

To develop all apps and packages, run the following command:

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

### Environment Variables

```bash
# apps/example-app
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=
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