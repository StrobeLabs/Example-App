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

```
ExampleApp.sol: 0xf623C10c85F74E27B2a25109E8Daf323c716Be53
AlwaysTrueVerifier.sol: 0x44Ae54c9661Fa1d9262615FCD1CBC88E49327A4e
```