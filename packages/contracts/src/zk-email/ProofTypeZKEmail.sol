// SPDX-License-Identifier: MIT
pragma solidity >=0.8.25;

import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {IERC257} from "@strobelabs/contracts/src/core/interfaces/IERC257.sol";
import {IVerifier} from "./IVerifier.sol";

contract ProofTypeZKEmail is IERC257 {
    IVerifier immutable verifier;

    constructor(address _verifierContract) {
        verifier = IVerifier(_verifierContract);
    }
    /**
     * @dev Verifies a zk-SNARK proof using the Groth16 verifier contract.
     * @param proof The zk-SNARK proof to be verified, encoded as a byte array.
     * @param publicSignals The inputs associated with the zk-SNARK proof, encoded as a byte array.
     * @return r A boolean indicating whether the proof is valid or not.
     */

    function verify(bytes memory proof, bytes memory publicSignals) external view returns (bool r) {
        // Decode the proof and publicSignals byte arrays into their respective components.
        // 'a', 'b', 'c' are the parts of the zk-SNARK proof, and 'inputs' are the proof inputs.
        (uint256[2] memory a, uint256[2][2] memory b, uint256[2] memory c, uint256[] memory inputs) =
            unwrap(proof, publicSignals);

        // Ensure the length of the inputs array matches the expected inputSize 7.
        require(inputs.length == 7, "Invalid number of inputs");

        // Construct the function signature for the verifier contract's verifyProof method.
        // This signature is dynamically generated based on the input size.
        string memory functionSignature = string(
            abi.encodePacked(
                "verify(uint256[2],uint256[2][2],uint256[2],uint256[7])"
            )
        );

        // Prepare the data to be sent in the static call.
        // This includes encoding the function signature and its parameters.
        bytes memory data = abi.encodePacked(abi.encodeWithSignature(functionSignature, a, b, c), inputs);

        // Call the verifyProof method of the Groth16 verifier contract.
        // 'staticcall' is used to execute the function call without altering the state.
        (bool success, bytes memory result) = address(verifier).staticcall(data);

        return success;
    }

    function unwrap(
        bytes memory proof,
        bytes memory publicSignals
    )
        internal
        pure
        returns (uint256[2] memory a, uint256[2][2] memory b, uint256[2] memory c, uint256[] memory inputs)
    {
        (a, b, c) = abi.decode(proof, (uint256[2], uint256[2][2], uint256[2]));
        inputs = abi.decode(publicSignals, (uint256[]));
    }

    /// @notice Implements ERC-165 interface check
    function supportsInterface(bytes4 interfaceId) public view virtual override returns (bool) {
        return interfaceId == type(IERC165).interfaceId || interfaceId == type(IERC257).interfaceId;
    }
}
