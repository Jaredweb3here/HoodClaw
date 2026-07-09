// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IERC20 {
    function transferFrom(address from, address to, uint256 value) external returns (bool);
}

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

    struct SettlementRequest {
        string invoiceId;
        string resource;
        address merchant;
        address payer;
        address operator;
        address asset;
        uint256 amount;
    }

    address public owner;
    bool public paused;
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

    event SettlementBatchRecorded(uint256 count, bytes32[] invoiceHashes);

    event Paused(address by);
    event Unpaused(address by);

    modifier onlyOwner() {
        require(msg.sender == owner, "not owner");
        _;
    }

    modifier whenNotPaused() {
        require(!paused, "router paused");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "zero owner");
        owner = newOwner;
    }

    function setPaused(bool _paused) external onlyOwner {
        paused = _paused;
        if (_paused) emit Paused(msg.sender);
        else emit Unpaused(msg.sender);
    }

    function getSettlement(bytes32 invoiceHash) external view returns (Settlement memory) {
        require(isSettled[invoiceHash], "not found");
        return settlements[invoiceHash];
    }

    function getSettlementsBatch(
        bytes32[] calldata invoiceHashes
    ) external view returns (Settlement[] memory batch) {
        batch = new Settlement[](invoiceHashes.length);
        for (uint256 i = 0; i < invoiceHashes.length; i++) {
            bytes32 invoiceHash = invoiceHashes[i];
            require(isSettled[invoiceHash], "not found");
            batch[i] = settlements[invoiceHash];
        }
    }

    function areSettledBatch(
        bytes32[] calldata invoiceHashes
    ) external view returns (bool[] memory statuses) {
        statuses = new bool[](invoiceHashes.length);
        for (uint256 i = 0; i < invoiceHashes.length; i++) {
            statuses[i] = isSettled[invoiceHashes[i]];
        }
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
    ) external whenNotPaused returns (bytes32 invoiceHash) {
        return _recordSettlement(invoiceId, resource, merchant, payer, operator, asset, amount);
    }

    function recordSettlementBatch(
        SettlementRequest[] calldata requests
    ) external whenNotPaused returns (bytes32[] memory invoiceHashes) {
        require(requests.length > 0, "empty batch");

        invoiceHashes = new bytes32[](requests.length);
        for (uint256 i = 0; i < requests.length; i++) {
            SettlementRequest calldata request = requests[i];
            invoiceHashes[i] = _recordSettlement(
                request.invoiceId,
                request.resource,
                request.merchant,
                request.payer,
                request.operator,
                request.asset,
                request.amount
            );
        }

        emit SettlementBatchRecorded(requests.length, invoiceHashes);
    }

    function _recordSettlement(
        string calldata invoiceId,
        string calldata resource,
        address merchant,
        address payer,
        address operator,
        address asset,
        uint256 amount
    ) internal returns (bytes32 invoiceHash) {
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

        require(IERC20(asset).transferFrom(payer, merchant, amount), "asset transfer failed");

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
