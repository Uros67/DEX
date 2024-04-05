import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import '@nomicfoundation/hardhat-ethers';
import 'hardhat-deploy';
import 'hardhat-deploy-ethers'
import "dotenv/config";

const RPC_URL= process.env.RPC_URL;
const PRIVATE_KEY= process.env.PRIVATE_KEY;
const ETHERSCAN_API = process.env.ETHERSCAN_API_KEY;
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY; 

const config: HardhatUserConfig = {
  solidity:{ 
    compilers: [
      {
        version: "0.8.9",
      },
      {
        version: "0.8.20",
      },
    ]
    },
  mocha: {
    timeout: 100000000,
  },
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 31337,
    },
    sepolia: {
      url: RPC_URL,
      accounts: [`0x${PRIVATE_KEY}`],
      chainId: 11155111,
    },
    goerli: {
      url: RPC_URL,
      accounts: [`0x${PRIVATE_KEY}`],
      chainId: 5,
      // blockConfirmations: 6,
    }
  },
  etherscan: {
    apiKey: ETHERSCAN_API,
  },
  gasReporter: {
    enabled: true,
    currency: "USD",
    outputFile: "gas-report.txt",
    noColors: true,
    coinmarketcap: COINMARKETCAP_API_KEY,
  },
  namedAccounts: {
    deployer: {
      default: 0,
      1: 0, 
    },
  },
};

export default config;
