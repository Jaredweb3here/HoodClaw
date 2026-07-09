# HoodClaw

[![License: MIT](https://img.shields.io/badge/license-MIT-00f0b5.svg)](./LICENSE)
[![Solidity](https://img.shields.io/badge/solidity-0.8.24-white.svg)](https://soliditylang.org/)
[![Network](https://img.shields.io/badge/network-Robinhood%20Chain%20Testnet-00f0b5.svg)](https://explorer.testnet.chain.robinhood.com)
[![Status](https://img.shields.io/badge/status-live%20test%20token%20flow-00f0b5.svg)](./deployments/testnet.json)
[![X](https://img.shields.io/badge/X-@hoodclaw__fun-111111.svg)](https://x.com/hoodclaw_fun)

HoodClaw is the operator-routed payment layer for AI-native paid APIs on Robinhood Chain.

This repository contains the live protocol contracts and deployment tooling for the first real HoodClaw settlement path on testnet.

## What Is Live

The current testnet stack is not just an event logger anymore.

It includes:

- a live `HoodClawSettlementRouter`
- a live `HoodClawOperatorRegistry`
- a live test token `MockUSDG`
- real token approvals
- real token transfers through settlement flow
- explorer-verifiable transaction proofs

## Product

HoodClaw gives a merchant a verifiable 402 payment flow:

1. the merchant quotes access to a protected resource
2. the client chooses an operator desk
3. settlement is executed and recorded through the router
4. the merchant unlocks only after onchain proof is valid

This keeps paid API access tied to chain truth instead of offchain trust or UI claims.

## Contracts

### `HoodClawSettlementRouter`

File:

- `contracts/HoodClawSettlementRouter.sol`

Responsibilities:

- compute deterministic invoice hashes
- move settlement asset with `transferFrom(...)`
- record settlement facts
- emit canonical settlement events
- give merchants a single proof surface to verify

### `HoodClawOperatorRegistry`

File:

- `contracts/HoodClawOperatorRegistry.sol`

Responsibilities:

- store operator identity
- store operator wallet
- store fee policy
- store active status
- store policy tier and endpoint metadata

### `MockUSDG`

File:

- `contracts/MockUSDG.sol`

Purpose:

- testnet settlement asset for the live demo flow
- ERC-20 style approve + transfer + transferFrom path
- used because the canonical docs address did not expose a testnet token contract at the time of deployment

## Live Testnet Deployment

Robinhood Chain testnet:

- Chain ID: `46630`
- RPC: `https://rpc.testnet.chain.robinhood.com`
- Explorer: `https://explorer.testnet.chain.robinhood.com`

Current deployed contracts:

- `MockUSDG`: `0xb783Db1d57D09De913e907400625560930671b66`
- `HoodClawSettlementRouter`: `0xb2d87494bEf7244b592D71cC0C35d798c2C01FbE`
- `HoodClawOperatorRegistry`: `0x1DC926A14Bb2337B610483E639f9c7E3a5652899`

Deployment record:

- `deployments/testnet.json`

## Verified Live Flow

Real test transactions already executed:

- approve tx:
  - `0xa9b02941e90f5619c118d03c00f896432625e44bf50c6aaf88cbfa07adff2535`
- settlement tx:
  - `0x57d3dc6bc6beff1cdea73f5b793786628f64e641e9c640dbf4c1d3f2293edfc0`
- merchant wallet funded:
  - `0xf1B111F58aE4065c4b275f3AACdf58499268101A`
- merchant amount received:
  - `5000000000000000000` = `5 MockUSDG`

Explorer links:

- approve:
  - `https://explorer.testnet.chain.robinhood.com/tx/0xa9b02941e90f5619c118d03c00f896432625e44bf50c6aaf88cbfa07adff2535`
- settlement:
  - `https://explorer.testnet.chain.robinhood.com/tx/0x57d3dc6bc6beff1cdea73f5b793786628f64e641e9c640dbf4c1d3f2293edfc0`
- merchant wallet:
  - `https://explorer.testnet.chain.robinhood.com/address/0xf1B111F58aE4065c4b275f3AACdf58499268101A`

## Verified Batch Flow

Real batch transactions executed through `recordSettlementBatch(...)`:

- batch router deploy tx:
  - `0xc6936527870ddaa71b12928b9fcd264357749a97cc8c49b67e49424d9ce3b24e`
- batch approve tx:
  - `0x115da2c87a19a8254a163d7497761fc1f851871ff816e5fa68116104a9d89669`
- batch settlement tx:
  - `0x771100e893c6461aec63d02b5d741cac874c07a4af92b63af63ed358d0b502f9`
- batch count:
  - `3`
- amount per settlement:
  - `250000000000000000` = `0.25 MockUSDG`
- batch read verification:
  - `areSettledBatch([three settled hashes, zero hash])` returned `[true, true, true, false]`
  - `getSettlementsBatch(...)` returned `3` settlement records

Explorer links:

- batch router deploy:
  - `https://explorer.testnet.chain.robinhood.com/tx/0xc6936527870ddaa71b12928b9fcd264357749a97cc8c49b67e49424d9ce3b24e`
- batch approve:
  - `https://explorer.testnet.chain.robinhood.com/tx/0x115da2c87a19a8254a163d7497761fc1f851871ff816e5fa68116104a9d89669`
- batch settlement:
  - `https://explorer.testnet.chain.robinhood.com/tx/0x771100e893c6461aec63d02b5d741cac874c07a4af92b63af63ed358d0b502f9`

## Repository Layout

```text
contracts/
  HoodClawSettlementRouter.sol
  HoodClawOperatorRegistry.sol
  MockUSDG.sol

deployments/
  testnet.json

scripts/
  deploy-hoodclaw.js
  test-live-settlement.js
  verify-info.js

hardhat.config.js
package.json
.env.example
LICENSE
```

## Quick Start

Install dependencies:

```bash
npm install
```

Compile contracts:

```bash
npm run compile
```

Run tests:

```bash
npm run test
```

Create `.env` from `.env.example` and set:

```bash
PRIVATE_KEY=0xYOUR_TESTNET_DEPLOYER_PRIVATE_KEY
RH_TESTNET_RPC_URL=https://rpc.testnet.chain.robinhood.com
```

Deploy to Robinhood Chain testnet:

```bash
npm run deploy:hoodclaw:testnet
```

Run a live settlement test:

```bash
npm run test:settlement:testnet
```

Show verification route:

```bash
npm run verify:hoodclaw:testnet
```

## Architecture Notes

Current protocol shape is intentionally narrow:

- canonical router over scattered proof surfaces
- registry-backed desks before permissionless complexity
- real test asset flow before pretending canonical stable settlement is live on testnet
- no fake slashing claims before dispute logic exists

This keeps the first release credible while preserving a clean path to:

- operator execution services
- merchant verifier middleware
- bond and dispute contracts
- richer operator policies
- account abstraction upgrades later

## Security Posture

Current trust boundaries:

- settlement truth comes from router state and events
- settlement asset movement comes from token `transferFrom(...)`
- operator identity comes from the registry contract
- merchant unlock logic should verify invoice id, asset, amount, recipient, and event source

Current non-goals:

- dispute resolution
- slashing mechanics
- permissionless desk entry
- paymaster logic

## Roadmap

- `getSettlement(bytes32)` — fetch full settlement struct by invoice hash
- `setPaused(bool)` — owner-only emergency pause
- `listOperators()` — return all registered operators in one call
- `deactivateOperator(string)` — owner-only operator deactivation

- settlement router contract
- operator registry contract
- MockUSDG testnet asset
- Robinhood Chain testnet deployment
- real approve + settlement tx path

### In Progress

- operator execution service
- merchant proof verifier middleware

### Next

- dispute and bond architecture
- operator deactivation flows
- permissionless desk entry
- account abstraction upgrades

## Links

- X: `https://x.com/hoodclaw_fun`
- Contracts repo: `https://github.com/Jaredweb3here/HoodClaw`
- Robinhood Chain docs: `https://docs.robinhood.com/chain`
- Robinhood Chain testnet explorer: `https://explorer.testnet.chain.robinhood.com`
