/**
 * estimate-gas.js
 * ──────────────────────────────────────────────────────────────────────────────
 * Estimates the MATIC cost of deploying BabyDoll.sol to Polygon Mainnet.
 * Fetches live gas price from the network — no deployment is performed.
 *
 * Usage:
 *   npx hardhat run scripts/estimate-gas.js --network polygon
 *   npx hardhat run scripts/estimate-gas.js --network amoy
 *   npx hardhat run scripts/estimate-gas.js --network hardhat
 * ──────────────────────────────────────────────────────────────────────────────
 */

const { ethers, network } = require("hardhat");

// Live MATIC/USD price fetch (CoinGecko public API — no key required)
async function fetchMaticUsdPrice() {
  try {
    const url =
      "https://api.coingecko.com/api/v3/simple/price?ids=matic-network&vs_currencies=usd";
    // Node.js 18+ has native fetch
    const res  = await fetch(url);
    const data = await res.json();
    return data?.["matic-network"]?.usd ?? null;
  } catch {
    return null; // non-fatal — USD estimate will be skipped
  }
}

async function main() {
  const [signer] = await ethers.getSigners();

  console.log("═══════════════════════════════════════════════════════════");
  console.log("  BabyDoll ($BDOLL) — Gas Cost Estimator");
  console.log("═══════════════════════════════════════════════════════════");
  console.log(`Network    : ${network.name} (Chain ID: ${network.config.chainId ?? "local"})`);
  console.log(`Estimating for deployer: ${signer.address}`);
  console.log("───────────────────────────────────────────────────────────");

  // ── Fetch fee data from the network ────────────────────────────────────────
  const feeData = await ethers.provider.getFeeData();

  // Polygon uses EIP-1559 — prefer maxFeePerGas, fall back to gasPrice
  const gasPrice =
    feeData.maxFeePerGas   ??
    feeData.gasPrice       ??
    ethers.parseUnits("30", "gwei"); // safe fallback if RPC gives nothing

  const gasPriceGwei = parseFloat(ethers.formatUnits(gasPrice, "gwei")).toFixed(4);

  console.log(`Gas price (live)      : ${gasPriceGwei} gwei`);
  if (feeData.maxFeePerGas) {
    const maxPrio = feeData.maxPriorityFeePerGas ?? 0n;
    console.log(
      `  maxFeePerGas        : ${ethers.formatUnits(feeData.maxFeePerGas, "gwei")} gwei`
    );
    console.log(
      `  maxPriorityFeePerGas: ${ethers.formatUnits(maxPrio, "gwei")} gwei`
    );
  }

  // ── Simulate deployment to get gas units ───────────────────────────────────
  const INITIAL_OWNER = process.env.INITIAL_OWNER || signer.address;
  const factory   = await ethers.getContractFactory("BabyDoll");
  const deployTx  = await factory.getDeployTransaction(INITIAL_OWNER);
  const gasUnits  = await ethers.provider.estimateGas({
    ...deployTx,
    from: signer.address,
  });

  // ── Calculate costs at 3 gas price scenarios ──────────────────────────────
  const scenarios = [
    { label: "Low    (30 gwei)",  price: ethers.parseUnits("30",  "gwei") },
    { label: "Medium (50 gwei)",  price: ethers.parseUnits("50",  "gwei") },
    { label: "High   (100 gwei)", price: ethers.parseUnits("100", "gwei") },
    { label: "Live   (current)",  price: gasPrice },
  ];

  // ── Fetch live MATIC/USD price ─────────────────────────────────────────────
  const maticUsd = await fetchMaticUsdPrice();
  const toUsd = (matic) =>
    maticUsd ? ` (~$${(parseFloat(matic) * maticUsd).toFixed(4)} USD)` : "";

  console.log(`\nEstimated gas units   : ${gasUnits.toLocaleString()}`);
  console.log("───────────────────────────────────────────────────────────");
  console.log("Deployment cost estimates:\n");

  for (const s of scenarios) {
    const cost     = gasUnits * s.price;
    const costMatic = ethers.formatEther(cost);
    console.log(`  ${s.label}`);
    console.log(`    Cost: ${costMatic} MATIC${toUsd(costMatic)}`);
  }

  // ── Additional operation estimates ────────────────────────────────────────
  console.log("\n───────────────────────────────────────────────────────────");
  console.log("Post-deployment operation estimates (at live gas price):\n");

  // We need a deployed instance to estimate method calls
  // Deploy to local fork or use bytecode estimates
  const GAS_ESTIMATES = {
    "transfer(address,uint256)"        : 65_000n,
    "approve(address,uint256)"         : 46_000n,
    "transferFrom(address,address,uint256)": 80_000n,
    "burn(uint256)"                    : 55_000n,
    "mint(address,uint256)"            : 70_000n,
    "permit(...)"                      : 75_000n,
  };

  for (const [method, gas] of Object.entries(GAS_ESTIMATES)) {
    const cost      = gas * gasPrice;
    const costMatic = ethers.formatEther(cost);
    console.log(`  ${method.padEnd(45)} ~${gas.toLocaleString()} gas`);
    console.log(`    Cost: ${costMatic} MATIC${toUsd(costMatic)}`);
  }

  // ── Summary table ──────────────────────────────────────────────────────────
  const liveCost      = gasUnits * gasPrice;
  const liveCostMatic = ethers.formatEther(liveCost);

  console.log("\n═══════════════════════════════════════════════════════════");
  console.log("SUMMARY");
  console.log("═══════════════════════════════════════════════════════════");
  console.log(`Network          : Polygon ${network.name === "polygon" ? "Mainnet" : network.name}`);
  console.log(`Contract         : BabyDoll (BDOLL)`);
  console.log(`Gas units needed : ${gasUnits.toLocaleString()}`);
  console.log(`Live gas price   : ${gasPriceGwei} gwei`);
  console.log(`Estimated cost   : ${liveCostMatic} MATIC${toUsd(liveCostMatic)}`);
  console.log(`\nRecommended wallet balance: ${
    parseFloat(liveCostMatic) < 0.01 ? "0.05" :
    (parseFloat(liveCostMatic) * 3).toFixed(4)
  } MATIC (3× buffer)`);

  if (maticUsd) {
    console.log(`MATIC/USD price  : $${maticUsd} (CoinGecko)`);
  } else {
    console.log("MATIC/USD price  : unavailable (offline or rate-limited)");
  }

  console.log("\nWhere to get MATIC:");
  console.log("  Mainnet : Buy on Binance, Coinbase, Kraken, or any major CEX");
  console.log("  Amoy    : https://faucet.polygon.technology (select Amoy)");
  console.log("═══════════════════════════════════════════════════════════\n");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Gas estimation failed:", err.message);
    process.exit(1);
  });
