// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract HoodClawSettlementRouter {
    struct Settlement {
        bytes32 invoiceHash;
        address merchant;
        address payer;
        address operator;
        address asset;
        uint256 amount;
        uint256 timestamp;
        string invoiceId;
        string resource;
    }

    address public owner;
    mapping(bytes32 => Settlement) public settlements;
    mapping(bytes32 => bool) public isSettled;

    event SettlementRecorded(
        bytes32 indexed invoiceHash,
        string invoiceId,
        string resource,
        address indexed merchant,
        address indexed payer,
        address operator,
        address asset,
        uint256 amount,
        uint256 timestamp
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "zero owner");
        owner = newOwner;
    }

    function computeInvoiceHash(
        string memory invoiceId,
        string memory resource,
        address merchant,
        address payer,
        address operator,
        address asset,
        uint256 amount
    ) public pure returns (bytes32) {
        return keccak256(
            abi.encode(invoiceId, resource, merchant, payer, operator, asset, amount)
        );
    }

    function recordSettlement(
        string calldata invoiceId,
        string calldata resource,
        address merchant,
        address payer,
        address operator,
        address asset,
        uint256 amount
    ) external returns (bytes32 invoiceHash) {
        require(merchant != address(0), "merchant required");
        require(operator != address(0), "operator required");
        require(asset != address(0), "asset required");
        require(amount > 0, "amount required");

        invoiceHash = computeInvoiceHash(
            invoiceId,
            resource,
            merchant,
            payer,
            operator,
            asset,
            amount
        );

        require(!isSettled[invoiceHash], "already settled");

        settlements[invoiceHash] = Settlement({
            invoiceHash: invoiceHash,
            merchant: merchant,
            payer: payer,
            operator: operator,
            asset: asset,
            amount: amount,
            timestamp: block.timestamp,
            invoiceId: invoiceId,
            resource: resource
        });

        isSettled[invoiceHash] = true;

        emit SettlementRecorded(
            invoiceHash,
            invoiceId,
            resource,
            merchant,
            payer,
            operator,
            asset,
            amount,
            block.timestamp
        );
    }
}
