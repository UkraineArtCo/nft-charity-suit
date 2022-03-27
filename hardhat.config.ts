import * as dotenv from "dotenv";

import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";

const config: any = dotenv.config().parsed;

module.exports = {
  solidity: "0.8.1",
  networks: {
    mumbai: {
      url: config.POLYGON_MUMBAI_URL,
      accounts: [`0x${config.PRIVATE_KEY}`],
    },
    /* ropsten: {
      url: config.ROPSTEN_URL,
      accounts: [`0x${config.PRIVATE_KEY}`],
    }, */
  },
};
