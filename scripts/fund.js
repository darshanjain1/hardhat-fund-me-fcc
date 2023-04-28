const { getNamedAccounts, ethers, network } = require("hardhat")

const main = async () => {
    const fundMe = await ethers.getContract("FundMe")
    console.log(
        "balance before funding",
        (await ethers.provider.getBalance(fundMe.address)).toString()
    )
    // const transactionResponse = await fundMe.fund({
    //     value: await ethers.utils.parseEther("0.25"),
    // })
    // await transactionResponse.wait(1)
    // console.log("funding done")
    // console.log(
    //     "balance after funding",
    //     (await ethers.provider.getBalance(fundMe.address)).toString()
    // )
}

main().catch((err) => {
    console.log("error occured while running main method", err)
    process.exit(1)
})
