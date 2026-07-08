const hre = require("hardhat");
const manifest = require("../deployments/testnet.json");

async function main() {
  const [wallet] = await hre.ethers.getSigners();
  const merchant = wallet.address;
  const payer = wallet.address;
  const operator = wallet.address;
  const amount = hre.ethers.parseUnits("1", 18);

  const token = await hre.ethers.getContractAt("MockUSDG", manifest.asset);
  const router = await hre.ethers.getContractAt("HoodClawSettlementRouter", manifest.settlementRouter);

  const approveTx = await token.approve(manifest.settlementRouter, amount);
  await approveTx.wait();

  const invoiceId = `live_${Date.now()}`;
  const settleTx = await router.recordSettlement(
    invoiceId,
    "demo:live-settlement",
    merchant,
    payer,
    operator,
    manifest.asset,
    amount
  );
  const receipt = await settleTx.wait();

  const invoiceHash = await router.computeInvoiceHash(
    invoiceId,
    "demo:live-settlement",
    merchant,
    payer,
    operator,
    manifest.asset,
    amount
  );
  const settled = await router.getSettlement(invoiceHash);

  const merchantBalance = await token.balanceOf(merchant);

  console.log(JSON.stringify({
    invoiceId,
    approveTx: approveTx.hash,
    settlementTx: settleTx.hash,
    blockNumber: receipt.blockNumber,
    invoiceHash,
    settledOnChain: settled.invoiceHash === invoiceHash,
    merchantBalance: merchantBalance.toString()
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
