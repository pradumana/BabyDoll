# BabyDoll Token (BDOLL)

A tradeable ERC-20 token built on Ethereum with burn, gasless-approval (EIP-2612 Permit), and owner-controlled minting.

| Property | Value |
|---|---|
| Name | BabyDoll |
| Symbol | BDOLL |
| Decimals | 18 |
| Initial Supply | 1,000,000,000 BDOLL |
| Max Supply | 10,000,000,000 BDOLL |
| Standard | ERC-20 + ERC20Burnable + ERC20Permit |

---

## Project Structure

```
babydoll-token/
├── contracts/
│   └── BabyDoll.sol        ← Token contract
├── scripts/
│   └── deploy.js           ← Deployment script
├── test/
│   └── BabyDoll.test.js    ← Test suite
├── .env.example            ← Environment variable template
├── .gitignore
├── hardhat.config.js
└── package.json
```

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- [npm](https://www.npmjs.com/) v9 or later
- An [Infura](https://infura.io) account (free tier is fine)
- An [Etherscan](https://etherscan.io/myapikey) API key (for contract verification)

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
PRIVATE_KEY=your_deployer_wallet_private_key
INFURA_API_KEY=your_infura_project_id
ETHERSCAN_API_KEY=your_etherscan_api_key

# Optional: send initial supply to a multisig instead of deployer
# INITIAL_OWNER=0xYourMultisigAddress
```

> **Security** — use a dedicated deployment wallet, not your main wallet. Never commit `.env`.

---

## Compile

```bash
npm run compile
```

---

## Test (Local Hardhat Network)

Runs the full test suite against an in-memory blockchain — no real ETH needed.

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

---

## Deploy to Testnet (Sepolia)

Sepolia is Ethereum's primary testnet. You need Sepolia ETH to pay gas — get some free from a faucet:

- https://sepoliafaucet.com
- https://faucet.quicknode.com/ethereum/sepolia

Then deploy:

```bash
npm run deploy:testnet
```

The script will:
1. Deploy `BabyDoll.sol` to Sepolia
2. Print the contract address and transaction hash
3. Wait 6 block confirmations
4. Automatically verify the contract on Etherscan

After deployment, view your token on Sepolia Etherscan:
```
https://sepolia.etherscan.io/token/<CONTRACT_ADDRESS>
```

### Add to MetaMask (Testnet)

1. Open MetaMask → switch to **Sepolia Testnet**
2. Click **Import tokens**
3. Paste the contract address
4. Symbol (`BDOLL`) and decimals (`18`) fill automatically
5. Click **Add custom token**

---

## Deploy to Mainnet

> **Read this before deploying to mainnet.**
>
> - Make sure all tests pass locally first.
> - Use a hardware wallet or multisig as `INITIAL_OWNER` in `.env`.
> - Deploying costs real ETH. Verify gas prices at https://etherscan.io/gastracker before deploying.
> - Once deployed, the contract is immutable. There is no undo.

When you are ready:

```bash
npm run deploy:mainnet
```

The script follows the same steps as testnet — it deploys, prints details, waits 6 confirmations, and verifies on Etherscan.

After deployment, view your token:
```
https://etherscan.io/token/<CONTRACT_ADDRESS>
```

### List on DEX (Uniswap)

Once deployed on mainnet you can create a trading pair on Uniswap v3:

1. Go to https://app.uniswap.org/#/add
2. Select **BDOLL** (paste your contract address) as one token
3. Select **USDT** (`0xdAC17F958D2ee523a2206206994597C13D831ec7`) as the other
4. Set your initial price and fee tier (0.3% is standard for new tokens)
5. Add liquidity — this is what makes BDOLL tradeable

> The more liquidity you provide, the lower the slippage for traders.

---

## Contract Features

### Burn
Any holder can destroy their own tokens, permanently reducing total supply:
```js
await token.burn(ethers.parseUnits("1000", 18));
```

### Mint (Owner only)
The owner can issue new tokens up to the 10B hard cap:
```js
await token.mint(recipientAddress, ethers.parseUnits("1000000", 18));
```

### Permit (Gasless Approvals)
Supports EIP-2612 — users can approve a spender via an off-chain signature, eliminating the need for a separate `approve` transaction.

### Transfer Ownership
Hand off control to a multisig after initial setup:
```js
await token.transferOwnership("0xYourMultisigAddress");
```

---

## Gas Estimates

Enable gas reporting by setting `REPORT_GAS=true` in `.env` then running tests:

```bash
REPORT_GAS=true npm test
```

---

## Security Considerations

- The contract uses OpenZeppelin v5 audited libraries.
- The owner has mint power — transfer ownership to a multisig (e.g. [Gnosis Safe](https://safe.global)) before going public.
- Consider renouncing ownership (`renounceOwnership()`) once the full supply is minted if you want a fully fixed supply.
- Get a professional audit before deploying significant liquidity on mainnet.
