require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

// ─── Environment variables ────────────────────────────────────────────────────
const PRIVATE_KEY         = process.env.PRIVATE_KEY         || "0x" + "0".repeat(64);
const POLYGONSCAN_API_KEY = process.env.POLYGONSCAN_API_KEY || "";

// Polygon RPC endpoints — public fallbacks so the config loads without a key.
// For production use your own Alchemy / Infura / QuickNode endpoint.
const POLYGON_MAINNET_RPC = process.env.POLYGON_MAINNET_RPC
  || "https://polygon-rpc.com";                           // public fallback

const POLYGON_AMOY_RPC = process.env.POLYGON_AMOY_RPC
  || "https://rpc-amoy.polygon.technology";               // public fallback (Amoy testnet)

// ─── Hardhat Config ───────────────────────────────────────────────────────────
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      // "paris" is the highest EVM version fully supported on Polygon PoS.
      // Do NOT use "cancun" — Polygon mainnet does not support it yet.
      evmVersion: "paris",
    },
  },

  networks: {
    // ── Local dev ──────────────────────────────────────────────────────────
    hardhat: {
      chainId: 31337,
    },

    // ── Polygon Amoy Testnet (replaces deprecated Mumbai) ──────────────────
    // Chain ID : 80002
    // Faucet   : https://faucet.polygon.technology  (select Amoy)
    // Explorer : https://amoy.polygonscan.com
    amoy: {
      url:      POLYGON_AMOY_RPC,
      accounts: [PRIVATE_KEY],
      chainId:  80002,
      gasPrice: "auto",
    },

    // ── Polygon Mainnet ────────────────────────────────────────────────────
    // Chain ID : 137
    // Explorer : https://polygonscan.com
    // Gas token: MATIC  (~$0.01–0.10 typical deploy cost)
    polygon: {
      url:      POLYGON_MAINNET_RPC,
      accounts: [PRIVATE_KEY],
      chainId:  137,
      gasPrice: "auto",
    },
  },

  // ── Contract verification via hardhat-verify ──────────────────────────────
  // Verifies on PolygonScan (polygonscan.com) for both mainnet & Amoy testnet.
  etherscan: {
    apiKey: {
      polygon:     POLYGONSCAN_API_KEY,
      polygonAmoy: POLYGONSCAN_API_KEY,
    },
    customChains: [
      {
        network:  "polygonAmoy",
        chainId:  80002,
        urls: {
          apiURL:     "https://api-amoy.polygonscan.com/api",
          browserURL: "https://amoy.polygonscan.com",
        },
      },
    ],
  },

  // ── Gas reporter ──────────────────────────────────────────────────────────
  gasReporter: {
    enabled:  process.env.REPORT_GAS === "true",
    currency: "USD",
    // Set COINMARKETCAP_API_KEY in .env for live USD pricing
    coinmarketcap: process.env.COINMARKETCAP_API_KEY || "",
    token:    "MATIC",         // report costs in MATIC, not ETH
    gasPriceApi:
      "https://api.polygonscan.com/api?module=proxy&method=eth_gasPrice",
  },
};
