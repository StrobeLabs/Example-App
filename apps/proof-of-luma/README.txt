# Proof of Luma

## Summary
Proof of Luma is a decentralized application (dApp) that demonstrates the integration of zkEmail. It showcases how users can prove ownership of a Luma email approved without revealing sensitive information.

## Tech Stack
- Next.js: React framework for building the frontend
- Firebase: Backend-as-a-Service for authentication and data storage (onchain messaging + storage)
- WalletConnect: For connecting to various Ethereum wallets
- ZK-RegEx: Zero-knowledge regular expression library for creating and verifying proofs
- Sepolia Testnet: Ethereum test network for deployment and testing

## Key Features
- NFT ownership verification using ZKPs
- Integration with Ethereum wallets
- Firebase authentication
- Interaction with custom smart contracts

## Setup and Configuration
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables:
   - Copy `env.txt` to `.env` and fill in the placeholders
   - Copy `env.local.txt` to `.env.local` and fill in the placeholders
4. Run the development server: `npm run dev`

## Important Notes
- Ensure all environment variables are correctly set before running the application
- The app uses Sepolia testnet, make sure your wallet is configured for Sepolia
- ZK-RegEx client ID and registry URL are crucial for the ZKP functionality
- Firebase configuration is necessary for authentication features
- Smart contract addresses (e.g., STROBE_CORE_ADDRESS, PROOF_OF_LUMA_REGISTRY_ADDRESS) should be updated if redeployed
- Always use test accounts and test ETH when interacting with the dApp on Sepolia
- Because this is made with firebase storage, you need to setup firebase storage for the app to work (in addition to firestore cloud).


