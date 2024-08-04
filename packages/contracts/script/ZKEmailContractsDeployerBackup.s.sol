// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.25;

import {Script} from "forge-std/src/Script.sol";
import{ ProofTypeZKEmail} from "../src/zk-email/ProofTypeZKEmail.sol";
import {console} from "forge-std/src/console.sol";
// import {MyVerifier} from "../src/zk-email/MyVerifier.sol";
import {ProofTypeGroth16} from "@strobelabs/contracts/src/proof-types/ProofTypeGroth16.sol";


contract ZKEmailContractsDeployerBackup is Script {
    function run() external {
        // Retrieve the private key from the environment variable
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        // Retrieve the verifier address from the environment variable
        address verifierAddress = vm.envAddress("GROTH16_VERIFIER_ADDRESS");

        // Start broadcasting transactions
        vm.startBroadcast(deployerPrivateKey);


        // Start Generation Here
        ProofTypeGroth16 groth16Adapter = new ProofTypeGroth16(verifierAddress, 7);

        // MyVerifier myVerifier = new MyVerifier(verifierAddress);

        // // Deploy the ProofTypeZKEmail contract
        // ProofTypeZKEmail zkEmailAdapter = new ProofTypeZKEmail(verifierAddress);

        // Stop broadcasting transactions
        vm.stopBroadcast();

        // Log the deployed contract address
        console.log("ProofTypeGroth16 deployed to:", address(groth16Adapter));
    }
}

