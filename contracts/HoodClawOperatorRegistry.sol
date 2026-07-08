// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract HoodClawOperatorRegistry {
    struct Operator {
        string id;
        address wallet;
        uint16 feeBps;
        bool active;
        string policyTier;
        string endpoint;
    }

    address public owner;
    mapping(bytes32 => Operator) private operators;
    bytes32[] private operatorKeys;

    event OperatorUpserted(
        bytes32 indexed key,
        string id,
        address wallet,
        uint16 feeBps,
        bool active,
        string policyTier,
        string endpoint
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function setOperator(
        string calldata id,
        address wallet,
        uint16 feeBps,
        bool active,
        string calldata policyTier,
        string calldata endpoint
    ) external onlyOwner {
        require(bytes(id).length > 0, "id required");
        require(wallet != address(0), "wallet required");
        bytes32 key = keccak256(bytes(id));

        if (operators[key].wallet == address(0)) {
            operatorKeys.push(key);
        }

        operators[key] = Operator({
            id: id,
            wallet: wallet,
            feeBps: feeBps,
            active: active,
            policyTier: policyTier,
            endpoint: endpoint
        });

        emit OperatorUpserted(key, id, wallet, feeBps, active, policyTier, endpoint);
    }

    function getOperator(string calldata id) external view returns (Operator memory) {
        return operators[keccak256(bytes(id))];
    }

    function totalOperators() external view returns (uint256) {
        return operatorKeys.length;
    }

    function listOperators() external view returns (Operator[] memory) {
        Operator[] memory result = new Operator[](operatorKeys.length);
        for (uint256 i = 0; i < operatorKeys.length; i++) {
            result[i] = operators[operatorKeys[i]];
        }
        return result;
    }

    function deactivateOperator(string calldata id) external onlyOwner {
        bytes32 key = keccak256(bytes(id));
        require(operators[key].wallet != address(0), "not found");
        operators[key].active = false;
        emit OperatorUpserted(
            key,
            operators[key].id,
            operators[key].wallet,
            operators[key].feeBps,
            false,
            operators[key].policyTier,
            operators[key].endpoint
        );
    }
}
