async function main() {
  console.log("Robinhood Chain testnet explorer verify endpoint:");
  console.log("https://explorer.testnet.chain.robinhood.com/api/");
  console.log("Use:");
  console.log("npx hardhat verify --network robinhoodTestnet <contract_address>");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
