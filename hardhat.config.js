require("@nomicfoundation/hardhat-toolbox")
require("dotenv").config()
require("hardhat-deploy")
require("hardhat-gas-reporter")
require("@nomiclabs/hardhat-ethers")
module.exports = {
    solidity: {
        compilers: [{ version: "0.8.18" }, { version: "0.6.12" }],
    },
    defaultNetwork: "hardhat",
    networks: {
        sepolia: {
            accounts: [
                process.env.ACCOUNT1_PRIVATE_KEY,
                process.env.ACCOUNT2_PRIVATE_KEY,
            ],
            chainId: 11155111,
            url: process.env.SEPOLIA_RPC_URL,
            blockConfirmations: 6,
        },
    },
    etherscan: {
        apiKey: process.env.SEPOLIA_ETHERSCAN_API_KEY,
    },
    namedAccounts: {
        deployer: {
            default: 0,
            11155111: 1,
        },
        user: {
            default: 1,
        },
    },
    gasReporter: {
        enabled: true,
        cuurency: "USD",
        coinmarketcap: process.env.COIN_MARKETCAP_API,
        outputFile: "gas-report.txt",
        noColors: true,
        token: "ETH",
    },
}
