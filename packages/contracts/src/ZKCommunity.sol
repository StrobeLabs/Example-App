// SPDX-License-Identifier: MIT
pragma solidity >=0.8.25;

import {IStrobeCore} from "@strobelabs/contracts/src/core/interfaces/IStrobeCore.sol";
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

contract ZKCommunity is IERC165 {
    IStrobeCore public immutable strobeCore;
    address public immutable verifierAddress;

    mapping(address => bool) public users;

    event UserJoined(address user);

    constructor(address _strobeCoreAddress, address _verifierAddress) {
        strobeCore = IStrobeCore(_strobeCoreAddress);
        verifierAddress = _verifierAddress;
    }

    function join(bytes memory proof, bytes memory publicInputs) external {
        require(!users[msg.sender], "User already joined");

        bool success = strobeCore.submitProof(verifierAddress, proof, publicInputs);
        require(success, "Proof verification failed");

        users[msg.sender] = true;
        emit UserJoined(msg.sender);
    }

    function isUserJoined(address user) external view returns (bool) {
        return users[user];
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override returns (bool) {
        return interfaceId == type(IERC165).interfaceId;
    }
}