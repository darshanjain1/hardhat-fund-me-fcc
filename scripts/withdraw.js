const { ethers } = require("hardhat")

const main = async () => {
    const fundMe = await ethers.getContract("FundMe")
    const transactionResponse = await fundMe.withdraw()
    await transactionResponse.wait("1")
    console.log(
        "contract balance after withdraw",
        (await ethers.provider.getBalance(fundMe.address)).toString()
    )
}

main().catch((err) => {
    console.log("eror occured during execution of withdraw script", err)
})
