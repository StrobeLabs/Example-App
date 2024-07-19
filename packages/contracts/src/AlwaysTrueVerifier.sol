// SPDX-License-Identifier: MIT
pragma solidity >=0.8.25;

import {IERC257} from "@strobelabs/core/interfaces/IERC257.sol";

contract AlwaysTrueVerifier is IERC257 {
    function verify(bytes calldata proof, bytes calldata inputs) external pure override returns (bool) {
        return true;
    }

    function supportsInterface(bytes4 interfaceId) external pure override returns (bool) {
        return interfaceId == type(IERC257).interfaceId;
    }
}
