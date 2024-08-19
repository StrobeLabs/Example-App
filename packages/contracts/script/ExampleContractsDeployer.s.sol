// SPDX-License-Identifier: MIT
pragma solidity >=0.8.25;

import {Script} from "forge-std/src/Script.sol";
import {AlwaysTrueVerifier} from "../src/example-app/AlwaysTrueVerifier.sol";
import {ExampleApp} from "../src/example-app/ExampleApp.sol";

contract ExampleContractsDeployer is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        address strobeCoreAddress = vm.envAddress("STROBE_CORE_ADDRESS");
        ExampleApp exampleApp = new ExampleApp(strobeCoreAddress);

        AlwaysTrueVerifier alwaysTrueVerifier = new AlwaysTrueVerifier();

        vm.stopBroadcast();
    }
}