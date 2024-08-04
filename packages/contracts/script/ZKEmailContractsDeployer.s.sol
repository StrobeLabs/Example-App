// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.25;

import {Script} from "forge-std/src/Script.sol";
import{ ProofTypeZKEmail} from "../src/zk-email/ProofTypeZKEmail.sol";
import {console} from "forge-std/src/console.sol";

contract ZKEmailContractsDeployer is Script {
    function run() external {
        // Retrieve the private key from the environment variable
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        // Retrieve the verifier address from the environment variable
        address verifierAddress = vm.envAddress("ZK_REGEX_VERIFIER_ADDRESS");

        // Start broadcasting transactions
        vm.startBroadcast(deployerPrivateKey);

        // Deploy the ProofTypeZKEmail contract
        ProofTypeZKEmail zkEmailAdapter = new ProofTypeZKEmail(verifierAddress);

        // Stop broadcasting transactions
        vm.stopBroadcast();

        // Log the deployed contract address
        console.log("ProofTypeZKEmail deployed to:", address(zkEmailAdapter));
    }
}

