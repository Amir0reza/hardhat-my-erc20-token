import { ethers } from "hardhat"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { assert, expect } from "chai"
import { MyERC20 } from "../../typechain-types/contracts/MyERC20"

describe("MyERC20 Token unit tests", function () {
    let deployer: SignerWithAddress,
        acc1: SignerWithAddress,
        acc2: SignerWithAddress,
        myERC20: MyERC20

    beforeEach(async () => {
        const accounts = await ethers.getSigners()
        deployer = accounts[0]
        acc1 = accounts[1]
        acc2 = accounts[2]

        const myERC20Factory = await ethers.getContractFactory("MyERC20")
        myERC20 = await myERC20Factory.deploy()
        await myERC20.deployed()
        // console.log(`MyERC20 contract deployed at ${myERC20.address}`)
    })

    describe("Constructor", function () {
        it("Check if the name is set correctly", async () => {
            const tokenName = await myERC20.name()
            assert.equal(tokenName.toString(), "MyERC20")
        })

        it("Check if the symbol is set correctly", async () => {
            const tokenSymbol = await myERC20.symbol()
            assert.equal(tokenSymbol.toString(), "MTK")
        })

        it("Check of the owner is the deployer", async () => {
            const owner = await myERC20.owner()
            assert.equal(owner, deployer.address)
        })

        it("Check is the token has 18 decimals", async () => {
            const decimals = await myERC20.decimals()
            assert.equal(decimals, 18)
        })

        it("Check if the totalSupply is equal to zero", async () => {
            const totalSupply = await myERC20.totalSupply()
            assert.equal(totalSupply.toString(), "0")
        })
    })

    describe("mint function", function () {
        it("It mints token to deployer account", async () => {
            await myERC20.mint(deployer.address, 1000)
            const deployerBalance = await myERC20.balanceOf(deployer.address)
            expect(deployerBalance.toString()).to.eq("1000")
        })

        it("It revert if called by non-owner account", async () => {
            await expect(
                myERC20.connect(acc1).mint(acc1.address, 1000)
            ).to.be.revertedWith("Ownable: caller is not the owner")
        })

        it("emit Transfer event from address 0 to account 1 1000 token", async () => {
            await expect(myERC20.mint(acc1.address, 1000))
                .to.emit(myERC20, "Transfer")
                .withArgs(ethers.constants.AddressZero, acc1.address, 1000)
        })
    })

    describe("transfer function", function () {
        beforeEach(async () => {
            await myERC20.mint(deployer.address, 1000)
        })

        it("transfer money from deployer to account 1", async () => {
            await myERC20.transfer(acc1.address, 1000)
            const acc1Balance = await myERC20.balanceOf(acc1.address)
            assert.equal(acc1Balance.toString(), "1000")
        })

        it("It revert if caller doesn't have enough balance", async () => {
            await expect(
                myERC20.connect(acc1).transfer(deployer.address, 1000)
            ).to.be.revertedWith("ERC20: transfer amount exceeds balance")
        })

        it("It revert if transfer money to address zero", async () => {
            await expect(
                myERC20.transfer(ethers.constants.AddressZero, 1000)
            ).to.be.revertedWith("ERC20: transfer to the zero address")
        })
    })

    describe("approve function", function () {
        beforeEach(async () => {
            await myERC20.mint(deployer.address, 1000)
        })

        it("approve account 1 to spend on behalf of deployer", async () => {
            await myERC20.approve(acc1.address, 1000)
            const account1Allowance = await myERC20.allowance(
                deployer.address,
                acc1.address
            )
            assert.equal(account1Allowance.toString(), "1000")
        })

        it("It revert if approve address zero to spend on behalf of deployer", async () => {
            await expect(
                myERC20.approve(ethers.constants.AddressZero, 1000)
            ).to.be.revertedWith("ERC20: approve to the zero address")
        })

        it("emit Approval event from address 0 to account 1 1000 token", async () => {
            await expect(myERC20.approve(acc1.address, 1000))
                .to.emit(myERC20, "Approval")
                .withArgs(deployer.address, acc1.address, 1000)
        })
    })

    describe("transferFrom function", function () {
        beforeEach(async () => {
            await myERC20.mint(deployer.address, 1000)
            await myERC20.approve(acc1.address, 1000)
        })

        it("transfer 1000 token from deployer to account 1", async () => {
            await myERC20
                .connect(acc1)
                .transferFrom(deployer.address, acc1.address, 1000)
            const acc1Balance = await myERC20.balanceOf(acc1.address)
            assert.equal(acc1Balance.toString(), "1000")
        })

        it("it reverts if the transfer amount is more than allowance", async () => {
            await expect(
                myERC20.transferFrom(deployer.address, acc1.address, 2000)
            ).to.be.revertedWith("ERC20: insufficient allowance")
        })

        it("reduce the allowance of acccount 1 when transfer money", async () => {
            await myERC20
                .connect(acc1)
                .transferFrom(deployer.address, acc1.address, 1000)
            const account1Allowance = await myERC20.allowance(
                deployer.address,
                acc1.address
            )
            assert.equal(account1Allowance.toString(), "0")
        })
    })

    describe("increaseAllowance function", function () {
        it("increase the allowance of account 1 to 2000", async () => {
            await myERC20.increaseAllowance(acc1.address, 2000)
            const account1Allowance = await myERC20.allowance(
                deployer.address,
                acc1.address
            )
            assert.equal(account1Allowance.toString(), "2000")
        })
    })

    describe("decreaseAllowance function", function () {
        it("decrease the allowance of account 1 to 1000", async () => {
            await myERC20.increaseAllowance(acc1.address, 2000)
            await myERC20.decreaseAllowance(acc1.address, 1000)
            const account1Allowance = await myERC20.allowance(
                deployer.address,
                acc1.address
            )
            assert.equal(account1Allowance.toString(), "1000")
        })
    })
})
