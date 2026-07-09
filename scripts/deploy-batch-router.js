const hre = require("hardhat");
const fs = require("fs");
const path = require("path");
const manifest = require("../deployments/testnet.json");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  if (!deployer) {
    throw new Error("No deployer configured. Set PRIVATE_KEY in .env or environment.");
  }

  const routerFactory = await hre.ethers.getContractFactory("HoodClawSettlementRouter");
  const router = await routerFactory.deploy();
  await router.waitForDeployment();

  const routerAddress = await router.getAddress();
  const deployTx = router.deploymentTransaction();
  const explorer = manifest.explorerUrl || "https://explorer.testnet.chain.robinhood.com";

  const nextManifest = {
    ...manifest,
    settlementRouter: routerAddress,
    batchSettlementRouter: routerAddress,
    batchRouterDeployer: deployer.address,
    batchRouterDeployedAt: new Date().toISOString(),
    latestBatchRouterDeployTx: deployTx.hash,
  };

  const manifestPath = path.join(__dirname, "..", "deployments", "testnet.json");
  fs.writeFileSync(manifestPath, `${JSON.stringify(nextManifest, null, 2)}\n`);

  console.log(JSON.stringify({
    deployer: deployer.address,
    settlementRouter: routerAddress,
    deployTx: deployTx.hash,
    deployLink: `${explorer}/tx/${deployTx.hash}`,
    routerLink: `${explorer}/address/${routerAddress}`,
    manifestPath,
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
