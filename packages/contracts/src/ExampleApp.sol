// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {StrobeCore} from "@strobelabs/core/StrobeCore.sol";

contract ExampleApp {
    StrobeCore private strobeCore;

    event ProofRequested(uint256 requestId);
    event ProofVerified(uint256 requestId, bool success);

    constructor(address strobeCoreAddress) {
        strobeCore = StrobeCore(strobeCoreAddress);
    }

    function requestProof(address verifierAddress, string memory ipfsHash) external {
        uint256 requestId = strobeCore.requestProof(verifierAddress, ipfsHash);
        emit ProofRequested(requestId);
    }

    function onVerify(bool success, uint256 requestId) external {
        require(msg.sender == address(strobeCore), "Only StrobeCore can call this function");
        emit ProofVerified(requestId, success);
    }
}
