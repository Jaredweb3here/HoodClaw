# HoodClaw

HoodClaw is an operator-routed payment layer for AI-native paid APIs on Robinhood Chain.

It gives a merchant a clean 402 flow:

- quote access to a protected resource
- route settlement through an operator desk
- record proof in a canonical settlement router
- unlock only after verifiable onchain truth

The current repo includes:

- live Robinhood Chain testnet contracts
- a public product site
- a real browser-based settlement demo
- deployment wiring that pushes live addresses into the frontend

## Product

HoodClaw is built for machine-to-machine payments, not generic checkout.

Target flow:

1. A merchant API responds with `402 Payment Required`
2. The response includes invoice metadata, accepted operators, and settlement constraints
3. A client or agent chooses an operator
4. Settlement is recorded through `HoodClawSettlementRouter`
5. The merchant verifies the router event and unlocks the resource

This keeps the unlock rule tied to chain evidence instead of frontend claims or offchain state.

## Live Testnet Deployment

Robinhood Chain testnet:

- Chain ID: `46630`
- RPC: `https://rpc.testnet.chain.robinhood.com`
- Explorer: `https://explorer.testnet.chain.robinhood.com`

Current deployed contracts:

- `HoodClawSettlementRouter`: `0xe77983a3E3775d37A0Ae4E636E9F154B96Ed6fEa`
- `HoodClawOperatorRegistry`: `0xdc623059b9D9762f93Ff0Caa4D8505263eC3a294`

Deployment manifest:

- `public/hoodclaw-testnet.json`

Canonical Robinhood Chain settlement asset used in examples:

- `USDG`: `0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168`

## Architecture

Core components:

### 1. Settlement Router

`contracts/HoodClawSettlementRouter.sol`

Responsibilities:

- compute deterministic invoice hashes
- record settlement facts
- emit canonical proof events for merchant verification

### 2. Operator Registry

`contracts/HoodClawOperatorRegistry.sol`

Responsibilities:

- store operator identity
- store wallet and fee policy
- store active status and policy tier

### 3. Frontend Product Surface

Static product site files:

- `index.html`
- `build.html`
- `network.html`
- `docs.html`
- `operators.html`
- `architecture.html`
- `site.js`
- `styles.css`

Responsibilities:

- present the product clearly
- load the live deployment manifest
- allow a user to send a real testnet settlement from the browser

### 4. Deploy Wiring

`scripts/deploy-hoodclaw.js`

Responsibilities:

- deploy contracts to Robinhood Chain testnet
- seed default operators
- write `public/hoodclaw-testnet.json`

## Repo Structure

```text
contracts/
  HoodClawSettlementRouter.sol
  HoodClawOperatorRegistry.sol

scripts/
  deploy-hoodclaw.js
  verify-info.js

public/
  hoodclaw-testnet.json

index.html
build.html
network.html
docs.html
operators.html
architecture.html
site.js
styles.css
hardhat.config.js
package.json
```

## Local Development

Install dependencies:

```bash
npm install
```

Compile contracts:

```bash
npm run compile
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

Verification helper:

```bash
npm run verify:hoodclaw:testnet
```

## Frontend Demo

The main interactive surface is:

- `build.html#live-demo`

What it does:

- loads the live deployment manifest
- switches MetaMask to Robinhood Chain testnet
- calls `recordSettlement(...)`
- returns a real tx hash and explorer trail

This is not a fake demo. It writes a real testnet settlement transaction.

## Infra Notes

Current infra posture:

- Contracts: Solidity + Hardhat
- Network: Robinhood Chain testnet first
- Asset examples: USDG on Robinhood Chain
- Wallet UX: MetaMask-compatible EVM wallets
- Frontend runtime: static HTML/CSS/JS

Planned next infra layer:

- operator service mock
- merchant proof verifier
- explorer-backed settlement feed
- operator registry read path in UI
- SDK prototype for 402 negotiation

## Product Description

HoodClaw is the operator layer between an AI client and a paid API.

Instead of trusting one centralized facilitator, the merchant can expose an operator market with clear routing rules, proof requirements, and verification boundaries.

The first release is intentionally simple:

- canonical router
- operator registry
- real testnet settlement path
- no fake slashing claims
- no token theater

The goal is to make paid API access feel credible, inspectable, and automatable.

## Roadmap

### Done

- align the product around HoodClaw on Robinhood Chain
- deploy router and registry to Robinhood Chain testnet
- wire live deploy manifest into the public site
- ship browser-triggered settlement demo

### Next

- operator execution service
- merchant verifier middleware
- proof polling
- recent settlements feed
- SDK for invoice -> operator -> proof -> retry flow

## Links

- X: `https://x.com/hoodclaw_fun`
- Robinhood Chain docs: `https://docs.robinhood.com/chain`
- Robinhood Chain contracts: `https://docs.robinhood.com/chain/contracts`
- Robinhood Chain explorer: `https://explorer.testnet.chain.robinhood.com`

## License

No license file has been added yet.
