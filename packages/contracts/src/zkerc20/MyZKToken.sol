// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {ZKERC20} from "@strobelabs/contracts/src/templates/ZKERC20.sol";

contract MyZKToken is ZKERC20 {
    constructor(
        address strobeCoreAddress,
        address verifierAddress
    )
        ZKERC20("MyZKToken", "MZT", strobeCoreAddress, verifierAddress)
    {}

    function mintWithProof(bytes calldata proof, bytes calldata publicSignals) external override {
        require(strobeCore.submitProof(verifierAddress, proof, publicSignals), "ZKERC20: Invalid proof");

        uint256 amountToMint = interpretSignals(publicSignals);
        _mint(msg.sender, amountToMint);
    }

    function interpretSignals(bytes calldata publicSignals) internal pure override returns (uint256) {
        // Decode the public signals
        uint256[] memory unwrappedPublicSignals = abi.decode(publicSignals, (uint256[]));

        // Extract the amount to mint (first number of the two numbers multiplying to 420)
        uint256 amountToMint = unwrappedPublicSignals[0];

        return amountToMint;
    }
}
