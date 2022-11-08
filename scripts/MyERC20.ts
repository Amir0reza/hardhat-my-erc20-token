import { ethers } from "hardhat"

async function main() {
    const accounts = await ethers.getSigners()
    const tokenContractFactory = await ethers.getContractFactory("MyERC20")
    const tokenContract = await tokenContractFactory.deploy()
    await tokenContract.deployed()
    console.log(`Contract deployed at ${tokenContract.address}`)

    // Minting tokens
    const mintTx = await tokenContract.mint(accounts[1].address, 2)
    await mintTx.wait()

    const mintTx1 = await tokenContract.mint(accounts[0].address, 1)
    await mintTx1.wait()

    // Sending a transaction
    const tx = await tokenContract.transfer(accounts[1].address, 1)
    await tx.wait()
    const [name, symbol, decimals, totalSupply] = await Promise.all([
        tokenContract.name(),
        tokenContract.symbol(),
        tokenContract.decimals(),
        tokenContract.totalSupply(),
    ])
    console.log({ name, symbol, decimals, totalSupply })
    const acc0Balance = await tokenContract.balanceOf(accounts[0].address)
    console.log(
        `Balance of account[0] is ${acc0Balance.toString()} decimals units`
    )
    const acc1Balance = await tokenContract.balanceOf(accounts[1].address)
    console.log(
        `Balance of account[1] is ${acc1Balance.toString()} decimals units`
    )
}

main().catch((err) => {
    console.error(err)
    process.exitCode = 1
})
