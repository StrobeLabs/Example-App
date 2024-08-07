// SPDX-License-Identifier: MIT
pragma solidity >=0.8.25;

import {Script} from "forge-std/src/Script.sol";
import {Groth16Verifier} from "../src/zkerc20/Groth16Verifier.sol";
import {ProofTypeGroth16} from "@strobelabs/contracts/src/proof-types/ProofTypeGroth16.sol";
import {MyZKToken} from "../src/zkerc20/MyZKToken.sol";

contract ZKERC20ContractsDeployer is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        address strobeCoreAddress = vm.envAddress("STROBE_CORE_ADDRESS");

        Groth16Verifier groth16Verifier = new Groth16Verifier();
        ProofTypeGroth16 proofTypeGroth16 = new ProofTypeGroth16(address(groth16Verifier), 1);

        MyZKToken myZKToken = new MyZKToken(strobeCoreAddress, address(proofTypeGroth16));

        vm.stopBroadcast();
    }
}