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

* ExampleApp.sol: [0x5075dC1c1174EBF96808414921206BC005794950](https://sepolia.etherscan.io/address/0x5075dC1c1174EBF96808414921206BC005794950)
* AlwaysTrueVerifier.sol: [0xaD2070a742F8FA7BBe2C89441E5fbA806794bb35](https://sepolia.etherscan.io/address/0xaD2070a742F8FA7BBe2C89441E5fbA806794bb35)