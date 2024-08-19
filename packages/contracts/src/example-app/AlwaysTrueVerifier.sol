// SPDX-License-Identifier: MIT
pragma solidity >=0.8.25;

import {IERC257} from "@strobelabs/contracts/src/core/interfaces/IERC257.sol";
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

contract AlwaysTrueVerifier is IERC257 {
    function verify(
        bytes memory proof,
        bytes memory proofInputs) 
        external 
        pure 
        returns (bool r) {
        return true;
    }

    function supportsInterface(bytes4 interfaceId) external pure override returns (bool) {
        return interfaceId == type(IERC257).interfaceId || interfaceId == type(IERC165).interfaceId;
    }
}
