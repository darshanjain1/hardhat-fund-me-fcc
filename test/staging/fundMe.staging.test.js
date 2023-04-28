const { expect } = require("chai")
const { ethers, getNamedAccounts, network, deployments } = require("hardhat")
const { developmentChain } = require("../../helper-hardhat-config")
developmentChain.includes(network.name)
    ? describe.skip
    : describe("fundMe", () => {
          let fundMe
          let deployer
          const value = ethers.utils.parseEther("0.02714440825190011")
          beforeEach(async () => {
              deployer = (await getNamedAccounts()).deployer
              fundMe = await ethers.getContract("FundMe", deployer)
          })

          it("allows to fund & withdraw", async () => {
              // await expect(fundMe.getAddressToAmountFunded("0x3305f3484d14adff709e72cba73f924028d87a57")).to.be.reverted
              await (await fundMe.fund({ value })).wait()
              await (await fundMe.withdraw()).wait()
              //    expect("0x3305F3484D14adFF709e72cBA73f924028d87a57").to.equal(await fundMe.getOwner())
              expect("0").to.equal(
                  (await fundMe.provider.getBalance(fundMe.address)).toString()
              )
          })
      })
