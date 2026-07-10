require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");

const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const RH_TESTNET_RPC_URL =
  process.env.RH_TESTNET_RPC_URL || "https://rpc.testnet.chain.robinhood.com";

const RH_MAINNET_RPC_URL =
  process.env.RH_MAINNET_RPC_URL || "https://rpc.mainnet.chain.robinhood.com";

module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    robinhoodTestnet: {
      url: RH_TESTNET_RPC_URL,
      chainId: 46630,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
    robinhoodMainnet: {
      url: RH_MAINNET_RPC_URL,
      chainId: 4663,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS === "true",
    currency: "USD",
    outputFile: "gas-report.txt",
    noColors: true,
  },
  etherscan: {
    apiKey: {
      robinhoodTestnet: "empty",
    },
    customChains: [
      {
        network: "robinhoodTestnet",
        chainId: 46630,
        urls: {
          apiURL: "https://explorer.testnet.chain.robinhood.com/api/",
          browserURL: "https://explorer.testnet.chain.robinhood.com/",
        },
      },
    ],
  },
};
