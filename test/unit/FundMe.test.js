const { assert, expect } = require("chai")
const { ethers, deployments, getNamedAccounts } = require("hardhat")
const { developmentChain } = require("../../helper-hardhat-config")

!developmentChain.includes(network.name)
    ? describe.skip
    : describe("FundMe", () => {
          let fundMe
          let mockV3Aggregator
          let deployer
          let getBalance
          const value = ethers.utils.parseEther("0.025")
          beforeEach(async () => {
              deployer = (await getNamedAccounts()).deployer
              await deployments.fixture()
              fundMe = await ethers.getContract("FundMe")
              mockV3Aggregator = await ethers.getContract("MockV3Aggregator")
              getBalance = async (address) =>
                  await fundMe.provider.getBalance(address)
          })

          describe("constructor", () => {
              it("should set the right pricefeed address", async () => {
                  assert.equal(
                      mockV3Aggregator.address,
                      await fundMe.getPriceFeed()
                  )
              })
          })

          describe("funds", () => {
              it("should throw error if less than 50USD worth of eth is not transfered", async () => {
                  //   await expect(fundMe.fund({value})).to.be.revertedWith('minimum funding of 50USD is allowed')
                  await expect(fundMe.fund()).to.be.reverted
              })
              it("update the amount funded data structure", async () => {
                  await fundMe.fund({ value })
                  assert.equal(
                      value.toString(),
                      (
                          await fundMe.getAddressToAmountFunded(deployer)
                      ).toString()
                  )
              })
              it("update the funders list", async () => {
                  await fundMe.fund({ value })
                  expect(deployer).to.be.equal(await fundMe.getFunder(0))
              })
          })

          describe("withdraw", () => {
              beforeEach(async () => {
                  await fundMe.fund({ value })
              })
              it("withdraws ETH from a single funder", async () => {
                  const startingContractBalance = await getBalance(
                      fundMe.address
                  )
                  const startingDeployerBalance = await getBalance(deployer)
                  const transactionResponse = await fundMe.withdraw()
                  const { gasUsed, effectiveGasPrice } =
                      await transactionResponse.wait()
                  const gasCost = gasUsed * effectiveGasPrice

                  const endingContractBalance = await getBalance(fundMe.address)
                  const endingDeployerBalance = await getBalance(deployer)
                  assert.equal(endingContractBalance, 0)
                  assert.equal(
                      startingContractBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  )
              })

              it("allows us to withdraw with multiple funders", async () => {
                  //Arrange ---> Act --> Assert

                  //Arrange
                  const accounts = await ethers.getSigners()
                  for (let index = 1; index < 5; index++) {
                      const signer = accounts[index]
                      const transactionResponse = await (
                          await fundMe.connect(signer)
                      ).fund({ value })
                      await transactionResponse.wait()
                  }
                  const contractBalanceAfterFunding = await getBalance(
                      fundMe.address
                  )
                  const deployerBalanceBeforeFunding = await getBalance(
                      deployer
                  )

                  //Act
                  const transactionResponse = await fundMe.withdraw()
                  const transactionReceipt = await transactionResponse.wait()
                  await expect(fundMe.getFunder(0)).to.be.reverted

                  //Assert
                  // expect(0).to.equal(await fundMe.getAddressToAmountFunded(accounts[1].address))
                  assert.equal(
                      await fundMe.getAddressToAmountFunded(
                          accounts[1].address
                      ),
                      0
                  )
                  const deployerBalanceAfterFunding = await getBalance(deployer)
                  const { gasUsed, effectiveGasPrice } =
                      await transactionReceipt
                  const gasCost = gasUsed * effectiveGasPrice
                  expect(
                      deployerBalanceBeforeFunding.add(
                          contractBalanceAfterFunding
                      )
                  ).to.equal(deployerBalanceAfterFunding.add(gasCost))
              })
              it("allows us to cheaper withdraw with multiple funders", async () => {
                  //Arrange ---> Act --> Assert

                  //Arrange
                  const accounts = await ethers.getSigners()
                  for (let index = 1; index < 5; index++) {
                      const signer = accounts[index]
                      const transactionResponse = await (
                          await fundMe.connect(signer)
                      ).fund({ value })
                      await transactionResponse.wait()
                  }
                  const contractBalanceAfterFunding = await getBalance(
                      fundMe.address
                  )
                  const deployerBalanceBeforeFunding = await getBalance(
                      deployer
                  )

                  //Act
                  const transactionResponse = await fundMe.cheaperWithdraw()
                  const transactionReceipt = await transactionResponse.wait()
                  await expect(fundMe.getFunder(0)).to.be.reverted

                  //Assert
                  // expect(0).to.equal(await fundMe.getAddressToAmountFunded(accounts[1].address))
                  assert.equal(
                      await fundMe.getAddressToAmountFunded(
                          accounts[1].address
                      ),
                      0
                  )
                  const deployerBalanceAfterFunding = await getBalance(deployer)
                  const { gasUsed, effectiveGasPrice } =
                      await transactionReceipt
                  const gasCost = gasUsed * effectiveGasPrice
                  expect(
                      deployerBalanceBeforeFunding.add(
                          contractBalanceAfterFunding
                      )
                  ).to.equal(deployerBalanceAfterFunding.add(gasCost))
              })
              it("only owner is allowed to withdraw funds", async () => {
                  const fundContractConnectedToOtherAccount =
                      await fundMe.connect(await ethers.provider.getSigner(1))
                  await expect(
                      fundContractConnectedToOtherAccount.withdraw()
                  ).to.be.revertedWith("only owners can withdraw funds")
              })
          })
          describe("Transfer", () => {
              beforeEach(async () => {
                  await fundMe.fund({ value })
              })
              it("Should transfer funds to owner", async () => {
                  await expect(fundMe.withdraw()).to.changeEtherBalances(
                      [deployer, fundMe.address],
                      [value, `-${value}`]
                  )
              })
          })
      })
