// SPDX-License-Identifier: MIT
pragma solidity >=0.8.25;

import {ProofTypeGroth16} from "@strobelabs/contracts/src/proof-types/ProofTypeGroth16.sol";

contract MyVerifier is ProofTypeGroth16 {
    // Hardcode the input size to 7
    uint256 private constant INPUT_SIZE = 7;

    constructor(address _groth16VerifierAddress) ProofTypeGroth16(_groth16VerifierAddress, INPUT_SIZE) {

    }
}