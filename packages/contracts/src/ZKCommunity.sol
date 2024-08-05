// SPDX-License-Identifier: MIT
pragma solidity >=0.8.25;

import {IStrobeCore} from "@strobelabs/contracts/src/core/interfaces/IStrobeCore.sol";
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

contract ZKCommunity is IERC165 {
    IStrobeCore public immutable strobeCore;
    address public immutable verifierAddress;

    mapping(address => bool) public users;
    mapping(bytes32 => bool) private _usedProofs;

    event UserJoined(address user);

    constructor(address _strobeCoreAddress, address _verifierAddress) {
        strobeCore = IStrobeCore(_strobeCoreAddress);
        verifierAddress = _verifierAddress;
    }

    function join(bytes calldata proof, bytes calldata publicInputs) external {
        require(!isProofUsed(proof), "Proof already submitted");
        require(!users[msg.sender], "User already joined");

        bool success = strobeCore.submitProof(verifierAddress, proof, publicInputs);
        require(success, "Proof verification failed");

        users[msg.sender] = true;
        markProofAsUsed(proof);

        emit UserJoined(msg.sender);
    }

    function isProofUsed(bytes calldata proof) internal view returns (bool) {
        bytes32 proofHash = keccak256(proof);
        return _usedProofs[proofHash];
    }

    function markProofAsUsed(bytes calldata proof) internal {
        bytes32 proofHash = keccak256(proof);
        _usedProofs[proofHash] = true;
    }

    function isUserJoined(address user) external view returns (bool) {
        return users[user];
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override returns (bool) {
        return interfaceId == type(IERC165).interfaceId;
    }
}