// SPDX-License-Identifier: MIT
pragma solidity >=0.8.25;

import {Script} from "forge-std/src/Script.sol";
import {AlwaysTrueVerifier} from "../src/AlwaysTrueVerifier.sol";
import {ExampleApp} from "../src/ExampleApp.sol";

contract ExampleContractsDeployer is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        address strobeCoreAddress = 0x4bB502635E6fA6149968BAa7cd1aE18FE71293e5;
        ExampleApp exampleApp = new ExampleApp(strobeCoreAddress);

        AlwaysTrueVerifier AlwaysTrueVerifier = new AlwaysTrueVerifier();

        vm.stopBroadcast();
    }
}