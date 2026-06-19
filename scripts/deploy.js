const { ethers, network, run } = require("hardhat");

// ─── Network helpers ──────────────────────────────────────────────────────────

const NETWORK_META = {
  polygon: {
    currency:    "MATIC",
    explorer:    "https://polygonscan.com",
    tokenPath:   "token",
    faucet:      null,
  },
  amoy: {
    currency:    "MATIC",
    explorer:    "https://amoy.polygonscan.com",
    tokenPath:   "token",
    faucet:      "https://faucet.polygon.technology (select Amoy)",
  },
  hardhat: {
    currency:    "ETH",
    explorer:    null,
    faucet:      null,
  },
  localhost: {
    currency:    "ETH",
    explorer:    null,
    faucet:      null,
  },
};

function getMeta(name) {
  return NETWORK_META[name] || { currency: "ETH", explorer: null, faucet: null };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const [deployer] = await ethers.getSigners();
  const balance    = await ethers.provider.getBalance(deployer.address);
  const meta       = getMeta(network.name);

  console.log("=======================================================");
  console.log("  BabyDoll ($BDOLL) Token — Deployment");
  console.log("=======================================================");
  console.log(`Network        : ${network.name} (Chain ID: ${network.config.chainId ?? "local"})`);
  console.log(`Deployer       : ${deployer.address}`);
  console.log(`Balance        : ${ethers.formatEther(balance)} ${meta.currency}`);
  if (meta.faucet) {
    console.log(`Faucet         : ${meta.faucet}`);
  }
  console.log("-------------------------------------------------------");

  // ── Gas estimate ────────────────────────────────────────────────────────────
  const BabyDollFactory = await ethers.getContractFactory("BabyDoll");
  const deployTx = await BabyDollFactory.getDeployTransaction(deployer.address);
  const estimatedGas = await ethers.provider.estimateGas(deployTx);
  const feeData      = await ethers.provider.getFeeData();
  const gasPrice     = feeData.gasPrice ?? feeData.maxFeePerGas ?? 0n;
  const estimatedCost = estimatedGas * gasPrice;

  console.log(`Est. gas units : ${estimatedGas.toString()}`);
  console.log(`Gas price      : ${ethers.formatUnits(gasPrice, "gwei")} gwei`);
  console.log(`Est. cost      : ${ethers.formatEther(estimatedCost)} ${meta.currency}`);
  console.log("-------------------------------------------------------");

  // ── Guard — warn if balance is dangerously low ───────────────────────────
  if (balance < estimatedCost * 2n) {
    console.warn(
      `⚠  WARNING: Balance (${ethers.formatEther(balance)} ${meta.currency}) ` +
      `may be too low for deployment + buffer. Proceed with caution.`
    );
  }

  // ── Owner address ────────────────────────────────────────────────────────
  const INITIAL_OWNER = process.env.INITIAL_OWNER || deployer.address;
  console.log(`Initial owner  : ${INITIAL_OWNER}`);
  if (INITIAL_OWNER === deployer.address && network.name === "polygon") {
    console.warn(
      "⚠  RECOMMENDED: Set INITIAL_OWNER to a Gnosis Safe multisig on mainnet."
    );
  }
  console.log("Deploying contract…\n");

  // ── Deploy ───────────────────────────────────────────────────────────────
  const token = await BabyDollFactory.deploy(INITIAL_OWNER);
  await token.waitForDeployment();

  const address  = await token.getAddress();
  const deployTxHash = token.deploymentTransaction().hash;

  console.log(`✅ BabyDoll deployed`);
  console.log(`   Address  : ${address}`);
  console.log(`   Tx hash  : ${deployTxHash}`);
  if (meta.explorer) {
    console.log(`   Explorer : ${meta.explorer}/tx/${deployTxHash}`);
  }
  console.log("-------------------------------------------------------");

  // ── Token info ───────────────────────────────────────────────────────────
  const name        = await token.name();
  const symbol      = await token.symbol();
  const decimals    = await token.decimals();
  const totalSupply = await token.totalSupply();
  const maxSupply   = await token.MAX_SUPPLY();

  console.log(`Name           : ${name}`);
  console.log(`Symbol         : ${symbol}`);
  console.log(`Decimals       : ${decimals}`);
  console.log(`Total supply   : ${ethers.formatUnits(totalSupply, decimals)} ${symbol}`);
  console.log(`Max supply     : ${ethers.formatUnits(maxSupply, decimals)} ${symbol}`);
  if (meta.explorer) {
    console.log(`Token page     : ${meta.explorer}/${meta.tokenPath}/${address}`);
  }
  console.log("=======================================================\n");

  // ── Auto-verify on public networks ───────────────────────────────────────
  const isPublic = !["hardhat", "localhost"].includes(network.name);
  if (isPublic) {
    console.log("Waiting 8 block confirmations before verification…");
    await token.deploymentTransaction().wait(8);

    console.log(`Verifying contract on PolygonScan…`);
    try {
      await run("verify:verify", {
        address:              address,
        constructorArguments: [INITIAL_OWNER],
      });
      console.log("✅ Contract verified on PolygonScan.");
      if (meta.explorer) {
        console.log(`   ${meta.explorer}/address/${address}#code`);
      }
    } catch (err) {
      // Already verified or API key missing — non-fatal
      console.warn("⚠  Verification skipped:", err.message);
    }
  }

  // ── Uniswap / QuickSwap liquidity hint ───────────────────────────────────
  if (network.name === "polygon") {
    console.log("\n── Next steps on Polygon ──────────────────────────────");
    console.log("1. Add $BDOLL to MetaMask:");
    console.log(`   Token address : ${address}`);
    console.log("   Symbol        : BDOLL | Decimals: 18 | Chain: Polygon (137)");
    console.log("2. Create BDOLL/USDT liquidity pair on QuickSwap:");
    console.log("   https://quickswap.exchange/#/add");
    console.log("   USDT on Polygon: 0xc2132D05D31c914a87C6611C10748AEb04B58e8F");
    console.log("3. View on PolygonScan:");
    console.log(`   https://polygonscan.com/token/${address}`);
    console.log("───────────────────────────────────────────────────────\n");
  }

  console.log("Deployment complete. ✅");
  return address;
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Deployment failed:", err);
    process.exit(1);
  });
