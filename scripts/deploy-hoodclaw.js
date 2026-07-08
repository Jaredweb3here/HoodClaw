const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  if (!deployer) {
    throw new Error("No deployer configured. Set PRIVATE_KEY in .env");
  }

  console.log("Deployer:", deployer.address);
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Balance:", hre.ethers.formatEther(balance), "ETH");

  const tokenFactory = await hre.ethers.getContractFactory("MockUSDG");
  const initialSupply = hre.ethers.parseUnits("1000000", 18);
  const token = await tokenFactory.deploy(deployer.address, initialSupply);
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();

  const routerFactory = await hre.ethers.getContractFactory("HoodClawSettlementRouter");
  const router = await routerFactory.deploy();
  await router.waitForDeployment();
  const routerAddress = await router.getAddress();

  const registryFactory = await hre.ethers.getContractFactory("HoodClawOperatorRegistry");
  const registry = await registryFactory.deploy();
  await registry.waitForDeployment();
  const registryAddress = await registry.getAddress();

  console.log("MockUSDG:", tokenAddress);
  console.log("HoodClawSettlementRouter:", routerAddress);
  console.log("HoodClawOperatorRegistry:", registryAddress);

  const defaultOperators = [
    {
      id: "alpha",
      wallet: deployer.address,
      feeBps: 50,
      active: true,
      policyTier: "standard",
      endpoint: "https://hoodclaw.dev/operators/alpha"
    },
    {
      id: "beta",
      wallet: deployer.address,
      feeBps: 90,
      active: true,
      policyTier: "balanced",
      endpoint: "https://hoodclaw.dev/operators/beta"
    },
    {
      id: "gamma",
      wallet: deployer.address,
      feeBps: 120,
      active: true,
      policyTier: "premium",
      endpoint: "https://hoodclaw.dev/operators/gamma"
    }
  ];

  for (const operator of defaultOperators) {
    const tx = await registry.setOperator(
      operator.id,
      operator.wallet,
      operator.feeBps,
      operator.active,
      operator.policyTier,
      operator.endpoint
    );
    await tx.wait();
    console.log(`Seeded operator: ${operator.id}`);
  }

  const deploymentManifest = {
    chainId: 46630,
    rpcUrl: "https://rpc.testnet.chain.robinhood.com",
    explorerUrl: "https://explorer.testnet.chain.robinhood.com",
    settlementRouter: routerAddress,
    operatorRegistry: registryAddress,
    asset: tokenAddress,
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
  };

  const manifestPath = path.join(__dirname, "..", "public", "hoodclaw-testnet.json");
  fs.writeFileSync(manifestPath, `${JSON.stringify(deploymentManifest, null, 2)}\n`);
  console.log(`Wrote deployment manifest: ${manifestPath}`);

  console.log("Verification commands:");
  console.log(`npx hardhat verify --network robinhoodTestnet ${tokenAddress} \"${deployer.address}\" \"${initialSupply}\"`);
  console.log(`npx hardhat verify --network robinhoodTestnet ${routerAddress}`);
  console.log(`npx hardhat verify --network robinhoodTestnet ${registryAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
