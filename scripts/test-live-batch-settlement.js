const hre = require("hardhat");
const manifest = require("../deployments/testnet.json");

async function main() {
  const [wallet] = await hre.ethers.getSigners();
  if (!wallet) {
    throw new Error("No signer configured. Set PRIVATE_KEY in .env or environment.");
  }

  const merchant = process.env.BATCH_MERCHANT || wallet.address;
  const payer = wallet.address;
  const operator = process.env.BATCH_OPERATOR || wallet.address;
  const count = Number(process.env.BATCH_COUNT || "3");
  const amount = hre.ethers.parseUnits(process.env.BATCH_AMOUNT || "0.25", 18);
  const totalAmount = amount * BigInt(count);

  if (!Number.isInteger(count) || count <= 0) {
    throw new Error("BATCH_COUNT must be a positive integer");
  }

  const token = await hre.ethers.getContractAt("MockUSDG", manifest.asset);
  const router = await hre.ethers.getContractAt("HoodClawSettlementRouter", manifest.settlementRouter);

  const approveTx = await token.approve(manifest.settlementRouter, totalAmount);
  await approveTx.wait();

  const batchId = `batch_${Date.now()}`;
  const requests = Array.from({ length: count }, (_, index) => ({
    invoiceId: `${batchId}_${index + 1}`,
    resource: "demo:live-batch-settlement",
    merchant,
    payer,
    operator,
    asset: manifest.asset,
    amount,
  }));

  const settleTx = await router.recordSettlementBatch(requests);
  const receipt = await settleTx.wait();

  const invoiceHashes = [];
  for (const request of requests) {
    const invoiceHash = await router.computeInvoiceHash(
      request.invoiceId,
      request.resource,
      request.merchant,
      request.payer,
      request.operator,
      request.asset,
      request.amount
    );
    const settled = await router.getSettlement(invoiceHash);
    invoiceHashes.push({
      invoiceId: request.invoiceId,
      invoiceHash,
      settledOnChain: settled.invoiceHash === invoiceHash,
    });
  }

  const explorer = manifest.explorerUrl || "https://explorer.testnet.chain.robinhood.com";
  console.log(JSON.stringify({
    batchId,
    count,
    amount: amount.toString(),
    totalAmount: totalAmount.toString(),
    approveTx: approveTx.hash,
    batchSettlementTx: settleTx.hash,
    blockNumber: receipt.blockNumber,
    approveLink: `${explorer}/tx/${approveTx.hash}`,
    batchSettlementLink: `${explorer}/tx/${settleTx.hash}`,
    invoiceHashes,
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
