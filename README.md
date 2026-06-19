# BabyDoll Token ($BDOLL)

A tradeable ERC-20 token deployed on **Polygon Mainnet** with burn mechanics, gasless approvals (EIP-2612 Permit), and owner-controlled minting. Built on OpenZeppelin v5.

| Property | Value |
|---|---|
| Name | BabyDoll |
| Symbol | BDOLL |
| Decimals | 18 |
| Initial Supply | 1,000,000,000 BDOLL |
| Max Supply | 10,000,000,000 BDOLL |
| Standard | ERC-20 + ERC20Burnable + ERC20Permit |
| Network | Polygon Mainnet |
| Chain ID | 137 |
| Gas Token | MATIC |
| DEX | QuickSwap v3 (BDOLL/USDT pair) |
| USDT on Polygon | `0xc2132D05D31c914a87C6611C10748AEb04B58e8F` |

---

## Why Polygon?

| | Ethereum Mainnet | Polygon Mainnet |
|---|---|---|
| Deploy cost | ~$80–$200 | **~$0.05–$0.20** |
| Transfer gas | ~$2–$20 | **~$0.001–$0.01** |
| Finality | ~12 min | **~2 sec** |
| ERC-20 compatible | ✅ | ✅ |
| MetaMask support | ✅ | ✅ |
| Uniswap / DEX | Uniswap v3 | **QuickSwap v3** |

Polygon PoS is EVM-compatible — the same Solidity contract, the same MetaMask wallet, 99% lower gas fees.

---

## Project Structure

```
babydoll-token/
├── contracts/
│   └── BabyDoll.sol          ← ERC-20 token contract (unchanged)
├── scripts/
│   ├── deploy.js             ← Deployment script (Polygon-aware)
│   └── estimate-gas.js       ← MATIC gas cost estimator
├── test/
│   └── BabyDoll.test.js      ← Full test suite (20 tests)
├── landing/                  ← Landing page (HTML/CSS/JS)
├── .env.example              ← Environment variable template
├── .gitignore
├── hardhat.config.js         ← Polygon mainnet + Amoy testnet
├── package.json
└── vercel.json               ← Landing page deployment config
```

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- [npm](https://www.npmjs.com/) v9 or later
- A wallet with **MATIC** on Polygon Mainnet (~0.05 MATIC is enough)
- A [PolygonScan](https://polygonscan.com/myapikey) API key (free, for contract verification)
- Optional: [Alchemy](https://www.alchemy.com/) or [Infura](https://infura.io) for a private RPC endpoint

---

## Installation

```bash
cd babydoll-token
npm install
```

---

## Environment Setup

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

```env
# Deployer wallet private key (dedicated wallet, NOT your main wallet)
PRIVATE_KEY=your_private_key_here

# Polygon RPC — public endpoint works, Alchemy/Infura recommended for production
POLYGON_MAINNET_RPC=https://polygon-rpc.com

# Amoy testnet RPC (for testing before mainnet)
POLYGON_AMOY_RPC=https://rpc-amoy.polygon.technology

# PolygonScan API key — https://polygonscan.com/myapikey
POLYGONSCAN_API_KEY=your_polygonscan_api_key_here

# Optional: send initial supply to a multisig instead of deployer
# INITIAL_OWNER=0xYourMultisigAddress
```

> **Security** — use a dedicated deployment wallet. Never commit `.env`. Never use your main wallet private key.

---

## Add Polygon to MetaMask

If Polygon Mainnet isn't already in your MetaMask:

1. Open MetaMask → **Add Network** → **Add a network manually**
2. Fill in:

| Field | Value |
|---|---|
| Network Name | Polygon Mainnet |
| RPC URL | `https://polygon-rpc.com` |
| Chain ID | `137` |
| Currency Symbol | `MATIC` |
| Block Explorer | `https://polygonscan.com` |

Or use [chainlist.org](https://chainlist.org/chain/137) — one-click add.

---

## Compile

```bash
npm run compile
```

---

## Test

Runs all 20 tests against a local in-memory Hardhat network — no MATIC needed.

```bash
npm test
```

Expected output:

```
  BabyDoll (BDOLL)
    Deployment
      ✔ sets the correct name and symbol
      ✔ sets 18 decimals
      ✔ mints 1 billion BDOLL to the initial owner
      ✔ sets MAX_SUPPLY to 10 billion BDOLL
      ✔ assigns ownership to the initial owner
    Transfers
      ✔ allows owner to transfer tokens to alice
      ✔ reverts when sender has insufficient balance
      ✔ correctly updates balances on transfer
    Allowances
      ✔ allows alice to spend approved tokens on behalf of owner
      ✔ reverts transferFrom when allowance is exceeded
    Minting
      ✔ allows owner to mint additional tokens
      ✔ reverts when a non-owner tries to mint
      ✔ reverts when mint would exceed MAX_SUPPLY
      ✔ allows minting exactly up to MAX_SUPPLY
    Burning
      ✔ allows a holder to burn their own tokens
      ✔ allows burnFrom when allowance is set
      ✔ reverts burn when amount exceeds balance
    Ownership
      ✔ allows owner to transfer ownership
      ✔ allows owner to renounce ownership
    Permit (EIP-2612)
      ✔ supports the permit domain separator

  20 passing
```

With gas report:

```bash
npm run test:gas
```

---

## Estimate Deployment Cost

Check the live MATIC cost before spending anything:

```bash
npm run estimate:gas
```

Typical output on Polygon Mainnet:

```
═══════════════════════════════════════════════════════════
  BabyDoll ($BDOLL) — Gas Cost Estimator
═══════════════════════════════════════════════════════════
Network    : polygon (Chain ID: 137)
Gas units  : ~1,400,000
Live price : ~35 gwei

  Low    (30 gwei)  → ~0.042 MATIC  (~$0.03 USD)
  Medium (50 gwei)  → ~0.070 MATIC  (~$0.05 USD)
  High   (100 gwei) → ~0.140 MATIC  (~$0.10 USD)
  Live   (current)  → ~0.049 MATIC  (~$0.04 USD)

Recommended wallet balance: 0.15 MATIC (3× buffer)
```

> Deployment on Polygon costs **under $0.20** in virtually all market conditions.

---

## Deploy to Amoy Testnet

Amoy is Polygon's current testnet (Mumbai is deprecated). Get free test MATIC:

- [https://faucet.polygon.technology](https://faucet.polygon.technology) — select **Amoy**

```bash
npm run deploy:testnet
```

The script will:
1. Show your MATIC balance and estimated gas cost
2. Deploy `BabyDoll.sol` to Amoy
3. Print the contract address and transaction hash
4. Wait 8 block confirmations
5. Automatically verify the contract on PolygonScan (Amoy)

View your token:
```
https://amoy.polygonscan.com/token/<CONTRACT_ADDRESS>
```

### Add to MetaMask (Amoy testnet)

| Field | Value |
|---|---|
| Network Name | Polygon Amoy Testnet |
| RPC URL | `https://rpc-amoy.polygon.technology` |
| Chain ID | `80002` |
| Currency Symbol | `MATIC` |
| Block Explorer | `https://amoy.polygonscan.com` |

Then: MetaMask → **Import tokens** → paste contract address → BDOLL and 18 fill automatically.

---

## Deploy to Polygon Mainnet

> **Read before deploying.**
>
> - All 20 tests must pass locally first.
> - Run `npm run estimate:gas` to confirm you have enough MATIC.
> - Use a hardware wallet or Gnosis Safe multisig as `INITIAL_OWNER` in `.env`.
> - Once deployed, the contract is immutable. There is no undo.
> - Transfer ownership to a multisig immediately after deployment if deploying with a hot wallet.

```bash
npm run deploy:mainnet
```

Sample output:

```
═══════════════════════════════════════════════════════════
  BabyDoll ($BDOLL) Token — Deployment
═══════════════════════════════════════════════════════════
Network        : polygon (Chain ID: 137)
Deployer       : 0xYourAddress
Balance        : 0.25 MATIC
Est. gas units : 1,412,043
Gas price      : 34.2 gwei
Est. cost      : 0.04829 MATIC
-------------------------------------------------------
Initial owner  : 0xYourAddress
Deploying contract…

✅ BabyDoll deployed
   Address  : 0xDeploy...edAddress
   Tx hash  : 0xTxHash...
   Explorer : https://polygonscan.com/tx/0xTxHash...
-------------------------------------------------------
Name           : BabyDoll
Symbol         : BDOLL
Decimals       : 18
Total supply   : 1,000,000,000.0 BDOLL
Max supply     : 10,000,000,000.0 BDOLL
Token page     : https://polygonscan.com/token/0xDeploy...

Waiting 8 block confirmations before verification…
✅ Contract verified on PolygonScan.
```

### Add BDOLL to MetaMask (Mainnet)

1. Switch MetaMask to **Polygon Mainnet** (Chain ID 137)
2. Click **Import tokens**
3. Paste your deployed contract address
4. Symbol (`BDOLL`) and decimals (`18`) fill in automatically
5. Click **Add custom token** → **Import tokens**

---

## Create BDOLL/USDT Trading Pair

BabyDoll pairs with **USDT on Polygon** (not Ethereum USDT — different address):

| | Value |
|---|---|
| USDT on Polygon | `0xc2132D05D31c914a87C6611C10748AEb04B58e8F` |
| DEX | QuickSwap v3 |
| Fee tier | 1% (recommended for new tokens) |

Steps:

1. Go to [quickswap.exchange/#/add](https://quickswap.exchange/#/add/v3)
2. Token A: paste your BDOLL contract address
3. Token B: `0xc2132D05D31c914a87C6611C10748AEb04B58e8F` (USDT)
4. Set your initial price (e.g. 0.0001 USDT = 1 BDOLL means 1 USDT buys 10,000 BDOLL)
5. Select fee tier: **1%**
6. Add liquidity — you need both BDOLL and USDT

> The ratio you deposit sets the initial price. E.g. depositing 1,000,000 BDOLL and 100 USDT sets the price at 0.0001 USDT per BDOLL.

---

## Manual Verification (if auto-verify fails)

```bash
npm run verify:mainnet -- --address <CONTRACT_ADDRESS> --constructor-args <INITIAL_OWNER>
```

Or directly with Hardhat:

```bash
npx hardhat verify --network polygon <CONTRACT_ADDRESS> <INITIAL_OWNER_ADDRESS>
```

---

## Contract Features

### Burn
Any holder permanently destroys their tokens, reducing total supply:
```js
await token.burn(ethers.parseUnits("1000", 18));
```

### Mint (Owner only)
Issue new tokens up to the 10B hard cap:
```js
await token.mint(recipientAddress, ethers.parseUnits("1000000", 18));
```

### Permit (Gasless Approvals — EIP-2612)
Approve a spender via an off-chain signature — no separate `approve` transaction, saving gas:
```js
// Build permit signature off-chain, then:
await token.permit(owner, spender, value, deadline, v, r, s);
```

### Transfer Ownership
Hand control to a multisig after setup:
```js
await token.transferOwnership("0xYourGnosisSafeAddress");
```

---

## Gas Estimates on Polygon

All figures at 50 gwei (mid-range for Polygon):

| Operation | Gas Units | MATIC Cost | USD (at $0.70/MATIC) |
|---|---|---|---|
| Deploy contract | ~1,400,000 | ~0.070 MATIC | ~$0.05 |
| transfer() | ~65,000 | ~0.003 MATIC | ~$0.002 |
| approve() | ~46,000 | ~0.002 MATIC | ~$0.001 |
| transferFrom() | ~80,000 | ~0.004 MATIC | ~$0.003 |
| burn() | ~55,000 | ~0.003 MATIC | ~$0.002 |
| mint() | ~70,000 | ~0.004 MATIC | ~$0.003 |

Compare to Ethereum at $5/tx average — Polygon is **1000× cheaper**.

---

## Future: Staking, Rewards & Learn-to-Earn

The contract is designed for extensibility. Future modules can be added as separate contracts that interact with BDOLL:

```
BabyDoll.sol (core, immutable after renouncing ownership)
    ↓
StakingRewards.sol      ← stake BDOLL, earn BDOLL rewards
    ↓
LearnToEarn.sol         ← complete tasks, earn BDOLL
    ↓
BabyDollNFT.sol         ← NFT collection, payable in BDOLL
```

All of these work on Polygon with the same contract address — no migration needed.

### Compatibility checklist
- [x] ERC-20 standard — any DEX, wallet, or DeFi protocol can integrate
- [x] `mint()` function — rewards can be distributed on-chain
- [x] `burn()` function — deflationary mechanics for staking penalties
- [x] EIP-2612 Permit — gasless UX for reward claims
- [x] Ownable — staking contract can be set as owner for trustless minting
- [x] Polygon — 2-second finality, ideal for high-frequency reward distributions

---

## Security Considerations

- Built on OpenZeppelin v5 — industry-standard audited contracts.
- The owner has mint power up to the 10B hard cap. Transfer ownership to a [Gnosis Safe](https://safe.global) multisig before going public.
- Consider renouncing ownership (`renounceOwnership()`) once the final supply distribution is complete for a fully fixed supply.
- Get a professional security audit before deploying significant liquidity.
- Never share your private key. Use a hardware wallet (Ledger/Trezor) for mainnet.

---

## Network Quick Reference

| Network | Chain ID | RPC | Explorer |
|---|---|---|---|
| Polygon Mainnet | 137 | `https://polygon-rpc.com` | [polygonscan.com](https://polygonscan.com) |
| Polygon Amoy (testnet) | 80002 | `https://rpc-amoy.polygon.technology` | [amoy.polygonscan.com](https://amoy.polygonscan.com) |
| Hardhat (local) | 31337 | `http://127.0.0.1:8545` | — |
