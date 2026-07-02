# HoodClaw

[![License: MIT](https://img.shields.io/badge/license-MIT-00f0b5.svg)](./LICENSE)
[![Solidity](https://img.shields.io/badge/solidity-0.8.24-white.svg)](https://soliditylang.org/)
[![Network](https://img.shields.io/badge/network-Robinhood%20Chain%20Testnet-00f0b5.svg)](https://explorer.testnet.chain.robinhood.com)
[![X](https://img.shields.io/badge/X-@hoodclaw__fun-111111.svg)](https://x.com/hoodclaw_fun)

HoodClaw is the operator-routed payment layer for AI-native paid APIs on Robinhood Chain.

This repository contains the core protocol contracts and deployment tooling for the first HoodClaw settlement path.

## Product

HoodClaw gives a merchant a verifiable 402 payment flow:

1. the merchant quotes access to a protected resource
2. the client chooses an operator desk
3. settlement is recorded through a canonical router
4. the merchant unlocks only after onchain proof is valid

This keeps paid API access tied to chain truth instead of offchain trust or UI claims.

## Contracts

### `HoodClawSettlementRouter`

File:

- `contracts/HoodClawSettlementRouter.sol`

Responsibilities:

- compute deterministic invoice hashes
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

## Live Testnet Deployment

Robinhood Chain testnet:

- Chain ID: `46630`
- RPC: `https://rpc.testnet.chain.robinhood.com`
- Explorer: `https://explorer.testnet.chain.robinhood.com`

Current deployed contracts:

- `HoodClawSettlementRouter`: `0xe77983a3E3775d37A0Ae4E636E9F154B96Ed6fEa`
- `HoodClawOperatorRegistry`: `0xdc623059b9D9762f93Ff0Caa4D8505263eC3a294`

Canonical settlement asset used in examples:

- `USDG`: `0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168`

Deployment record:

- `deployments/testnet.json`

## Repository Layout

```text
contracts/
  HoodClawSettlementRouter.sol
  HoodClawOperatorRegistry.sol

deployments/
  testnet.json

scripts/
  deploy-hoodclaw.js
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

Show verification route:

```bash
npm run verify:hoodclaw:testnet
```

## Architecture Notes

Current protocol shape is intentionally narrow:

- canonical router over scattered proof surfaces
- registry-backed desks before permissionless complexity
- no fake slashing claims before dispute logic exists
- no token theater in the first release

This keeps the first release credible while preserving a clean path to:

- operator execution services
- merchant verifier middleware
- bond and dispute contracts
- richer operator policies
- account abstraction upgrades later

## Security Posture

Current trust boundaries:

- settlement truth comes from router state and events
- operator identity comes from the registry contract
- merchant unlock logic should verify invoice id, asset, amount, recipient, and event source

Current non-goals:

- dispute resolution
- slashing mechanics
- permissionless desk entry
- paymaster logic

## Roadmap

### Live now

- settlement router contract
- operator registry contract
- Robinhood Chain testnet deployment

### Next

- operator execution service
- merchant proof verifier
- dispute and bond architecture
- richer registry read surfaces

## Links

- X: `https://x.com/hoodclaw_fun`
- Contracts repo: `https://github.com/Jaredweb3here/HoodClaw`
- Robinhood Chain docs: `https://docs.robinhood.com/chain`
- Robinhood Chain contracts: `https://docs.robinhood.com/chain/contracts`
- Robinhood testnet explorer: `https://explorer.testnet.chain.robinhood.com`
