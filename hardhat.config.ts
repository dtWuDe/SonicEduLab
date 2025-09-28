import type { HardhatUserConfig } from "hardhat/config";
import harhatToolboxMochaEthersPlugin from "@nomicfoundation/hardhat-toolbox-mocha-ethers";
import * as dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  plugins: [harhatToolboxMochaEthersPlugin],
  solidity: {
    profiles: {
      default: { version: "0.8.28"},
      production: {
        version: "0.8.28",
        setting: { optimizer: {enable: true, runs: 200} },
      },
    },
  },
  networks: {
    hardhatMainnet: {
      type: "edr-simulated",
      chainType: "l1",
    },
    hardhatOp: {
      type: "edr-simulated",
      chainType: "l1",
    },
    sepolia: {
      type: "http",
      chainType: "l1",
      url: process.env.API_URL || "",
      account: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
};

export default config;
