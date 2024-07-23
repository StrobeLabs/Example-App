// SPDX-License-Identifier: MIT
pragma solidity >=0.8.25;

import {IERC257} from "@strobelabs/contracts/src/core/interfaces/IERC257.sol";

contract AlwaysTrueVerifier is IERC257 {
    function verifyProof(
        uint256[2] memory a, 
        uint256[2][2] memory b, 
        uint256[2] memory c, 
        uint256[2] memory input) 
        external 
        pure 
        returns (bool r) {
        return true;
    }

    function supportsInterface(bytes4 interfaceId) external pure override returns (bool) {
        return interfaceId == type(IERC257).interfaceId;
    }
}
