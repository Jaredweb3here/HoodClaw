const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("HoodClawSettlementRouter batching", function () {
  async function deployFixture() {
    const [owner, merchant, operator] = await ethers.getSigners();
    const supply = ethers.parseUnits("1000", 18);
    const token = await ethers.deployContract("MockUSDG", [owner.address, supply]);
    const router = await ethers.deployContract("HoodClawSettlementRouter");

    return { owner, merchant, operator, token, router };
  }

  it("records multiple settlements atomically", async function () {
    const { owner, merchant, operator, token, router } = await deployFixture();
    const amount = ethers.parseUnits("2", 18);
    const requests = [0, 1, 2].map((index) => ({
      invoiceId: `batch-${index}`,
      resource: "demo:batch-settlement",
      merchant: merchant.address,
      payer: owner.address,
      operator: operator.address,
      asset: token.target,
      amount,
    }));

    await token.approve(router.target, amount * BigInt(requests.length));

    const tx = await router.recordSettlementBatch(requests);
    await expect(tx).to.emit(router, "SettlementBatchRecorded");

    expect(await token.balanceOf(merchant.address)).to.equal(amount * BigInt(requests.length));

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
      const settlement = await router.getSettlement(invoiceHash);
      expect(settlement.invoiceHash).to.equal(invoiceHash);
      expect(settlement.amount).to.equal(request.amount);
    }
  });

  it("reverts an empty batch", async function () {
    const { router } = await deployFixture();
    await expect(router.recordSettlementBatch([])).to.be.revertedWith("empty batch");
  });
});
