// SPDX-License-Identifier: MIT
pragma solidity >=0.8.25;

import {Script} from "forge-std/src/Script.sol";
import {AlwaysTrueVerifier} from "../src/AlwaysTrueVerifier.sol";
import {ExampleApp} from "../src/ExampleApp.sol";

contract ExampleContractsDeployer is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        address strobeCoreAddress = 0x015f16b07D1E2d53CBce809551062E84F34FACCD;
        ExampleApp exampleApp = new ExampleApp(strobeCoreAddress);

        AlwaysTrueVerifier alwaysTrueVerifier = new AlwaysTrueVerifier();

        vm.stopBroadcast();
    }
}