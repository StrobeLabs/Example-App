// SPDX-License-Identifier: MIT
pragma solidity >=0.8.25;

interface IVerifier {
    function verify(
        uint256[2] memory a,
        uint256[2][2] memory b,
        uint256[2] memory c,
        uint256[7] memory signals
    ) external;
}