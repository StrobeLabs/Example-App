// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.25;

import {Script} from "forge-std/src/Script.sol";
import {ZKCommunity} from "../src/ZKCommunity.sol";
import {console} from "forge-std/src/console.sol";

contract ZKCommunityDeployer is Script {
    function run() external {
        // Retrieve the private key from the environment variable
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        // Retrieve the StrobeCore address from the environment variable
        address strobeCoreAddress = vm.envAddress("STROBE_CORE_ADDRESS");

        // Hardcoded verifier address
        address verifierAddress = vm.envAddress("ZK_EMAIL_257");

        // Start broadcasting transactions
        vm.startBroadcast(deployerPrivateKey);

        // Deploy the ZKCommunity contract
        ZKCommunity zkCommunity = new ZKCommunity(strobeCoreAddress, verifierAddress);

        // Stop broadcasting transactions
        vm.stopBroadcast();

        // Log the deployed contract address
        console.log("ZKCommunity deployed to:", address(zkCommunity));
    }
}