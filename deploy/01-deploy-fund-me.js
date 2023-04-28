const { network } = require("hardhat")
const { networkConfig, developmentChain } = require("../helper-hardhat-config")
const verify = require("../tasks/verify")
module.exports = async ({ getNamedAccounts, deployments, getChainId }) => {
    const { deployer } = await getNamedAccounts()
    const { deploy, get } = deployments
    let ethUsdPriceFeedAddress
    const isDevelopmentChain = developmentChain.includes(network.name)
    if (isDevelopmentChain) {
        const MockV3Aggregator = await get("MockV3Aggregator")
        ethUsdPriceFeedAddress = MockV3Aggregator.address
    } else
        ethUsdPriceFeedAddress =
            networkConfig[await getChainId()]["ethUsdPriceFeed"]
    const args = [ethUsdPriceFeedAddress]
    await deploy("FundMe", {
        from: deployer,
        args,
        waitConfirmations: network.config.blockConfirmations || 1,
        log: true,
    })
    if (!isDevelopmentChain && process.env.SEPOLIA_ETHERSCAN_API_KEY) {
        const FundMeContract = await get("FundMe")
        const address = FundMeContract.address
        await verify(address, args)
    }
    // what happens when we want to change chains?
    // when going for localhost or hardhat we want to you mock
}
module.exports.tags = ["all", "fundMe"]
