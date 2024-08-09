// SPDX-License-Identifier: MIT
pragma solidity >=0.8.25;

import {Script} from "forge-std/src/Script.sol";
import {ProofTypeZKEmail} from "@strobelabs/contracts/src/proof-types/ProofTypeZKEmail.sol";
import {ProofOfLumaRegistry} from "../src/zk-email/ProofOfLumaRegistry.sol";

contract ProofOfLumaContractsDeployer is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        address strobeCoreAddress = vm.envAddress("STROBE_CORE_ADDRESS");
        address verifierAddress = vm.envAddress("ZK_EMAIL_VERIFICATION_CONTRACT_ADDRESS");

        ProofTypeZKEmail proofTypeZKEmail = new ProofTypeZKEmail(verifierAddress, 7);

        ProofOfLumaRegistry proofOfLumaRegistry = new ProofOfLumaRegistry(strobeCoreAddress, address(proofTypeZKEmail));

        vm.stopBroadcast();
    }
}