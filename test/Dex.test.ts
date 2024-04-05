import {DEX, Roses} from "../typechain-types"
import {SignerWithAddress} from "@nomicfoundation/hardhat-ethers/signers";
import {assert, expect} from "chai";
import { deployments, ethers } from "hardhat";
import { token } from "../typechain-types/@openzeppelin/contracts";


 
describe("Dex", async function () {
    let dex: DEX;
    let roses: Roses;
    let deployer: SignerWithAddress;

    beforeEach(async function () {
        const accounts= await ethers.getSigners();
        deployer= accounts[0];

        await deployments.fixture("all");
        roses= await ethers.getContract("Roses");
        dex = await ethers.getContract("DEX");
    })
    describe("constructor", async function () {
        it("Sets token address corectly", async function () {
            const response = await dex.getTokenAddress();
            const rosesAddress = await roses.getAddress(); 
            assert.equal(response, rosesAddress);
            
        })
    })
    describe("init", async function () {
        it("Before initialization pool, total liquidity should be 0", async function () {
            const totalLiquidity= await dex.getLiquidity();
            assert.equal(totalLiquidity, ethers.parseEther("0"));
        })
        
        it("Should emit InitializedLiquidityPool", async function(){
            const DexAddress = await dex.getAddress();
            roses.approve(DexAddress, 50);
            await expect(dex.init(30, { value: ethers.parseEther("1") })).to.emit(dex, "InitializedLiquidityPool").withArgs(ethers.parseEther("1"), 30);
        })
        it("Should be reverted with allready initialize", async function () {
            const DexAddress = await dex.getAddress();
            roses.approve(DexAddress, 50);
            await dex.init(30, { value: ethers.parseEther("1") });
            const response2 = dex.init(10, { value: ethers.parseEther("2") });
            expect(response2).to.be.revertedWith("Dex: init - already has liquidity");
        })
    })
    describe("Exchange ETH and Token",async function () {
        let DexAddress: string;
        beforeEach(async function () {
            DexAddress = await dex.getAddress();
            roses.approve(DexAddress, 100);
            await dex.init(30, { value: ethers.parseEther("5") });
        })
        
        it("ETH reserves should be bigger after ETH to Token", async function () {
            const startingBalanceOfETH = await dex.getLiquidity();
            await dex.ethToToken({ value: ethers.parseEther("1") });
            const endingBalanceOfETH = await dex.getLiquidity();  
            const comparison = endingBalanceOfETH > startingBalanceOfETH;
            assert.isTrue(comparison);
            
        })

        it("Token reserve should be smaller after ETH to Token", async function () {
            const startingBalanceOfTokens = await roses.balanceOf(DexAddress);
            console.log(`Starting amount of tokens is: ${startingBalanceOfTokens}`);
            await dex.ethToToken({ value: ethers.parseEther("1") });
            const endingBalanceOfTokens = await roses.balanceOf(DexAddress);
            console.log(`Ending amount of tokens is: ${endingBalanceOfTokens}`);
            const comparison = endingBalanceOfTokens < startingBalanceOfTokens;
            assert.isTrue(comparison);

        })
        it("Token reserves should be bigger after Token to ETH", async function () {
            const startingBalanceOfTokens = await roses.balanceOf(DexAddress);
            console.log(`Starting amount of tokens is: ${startingBalanceOfTokens}`);
            roses.approve(DexAddress, 20)
            await dex.tokenToEth(5);
            const endingBalanceOfTokens = await roses.balanceOf(DexAddress);
            console.log(`Ending amount of tokens is: ${endingBalanceOfTokens}`);
            const comparison = endingBalanceOfTokens > startingBalanceOfTokens;
            assert.isTrue(comparison);
        })
        it("ETH reserves should be smaller after Token to ETH", async function () {
            const startingBalanceOfETH = await dex.getLiquidity();
            console.log(`Starting amount of ETH is: ${startingBalanceOfETH}`);
            roses.approve(DexAddress, 20)
            await dex.tokenToEth(5);
            const endingBalanceOfETH = await dex.getLiquidity();
            console.log(`Ending amount of ETH is: ${endingBalanceOfETH}`);
            const comparison= endingBalanceOfETH < startingBalanceOfETH;
            assert.isTrue(comparison);
        })
    })
    describe("Deposit and withdraw", async function (){
        let DexAddress : string;
        beforeEach(async function () { 
            DexAddress = await dex.getAddress();
            roses.approve(DexAddress, 100);
            await dex.init(30, { value: ethers.parseEther("5") });
        })
        it("Should increase eth reserves", async function () {
            const balanceBefore = await dex.getLiquidity()
            console.log(`Balance of eth before is: ${balanceBefore}`)
            await dex.deposit({value: ethers.parseEther("5")});
            const balanceAfter = await dex.getLiquidity();
            console.log(`Balance of eth before is: ${balanceAfter}`)
            const comparison= balanceAfter > balanceBefore;
            assert.isTrue(comparison);

        });
        it("Should increase token reserves", async function () {
            const balanceBefore = await roses.balanceOf(DexAddress);
            console.log(`Balance of eth before is: ${balanceBefore}`)
            await dex.deposit({ value: ethers.parseEther("5") });
            const balanceAfter = await roses.balanceOf(DexAddress);
            console.log(`Balance of eth before is: ${balanceAfter}`)
            const comparison = balanceAfter > balanceBefore;
            assert.isTrue(comparison);

        });
        it("Should decrease eth reserves", async function () {
            await dex.connect(deployer).deposit({ value: ethers.parseEther("5") });
            const balanceBeforeETH = await dex.getLiquidity();
            console.log(`Balance of eth before is: ${balanceBeforeETH}`);
            const value= ethers.parseEther("3");
            await dex.connect(deployer).withdraw(value);
            const balanceAfterETH = await dex.getLiquidity();
            console.log(`Balance of eth after is: ${balanceAfterETH}`);
            const comparison = balanceAfterETH < balanceBeforeETH;
            assert.isTrue(comparison);
        });

        it("Should decrease token reserves", async function () {
            await dex.connect(deployer).deposit({ value: ethers.parseEther("5") });
            const balanceBeforeToken = await roses.balanceOf(DexAddress);
            console.log(`Balance of token before is: ${balanceBeforeToken}`);
            const value = ethers.parseEther("3");
            await dex.connect(deployer).withdraw(value);
            const balanceAfterToken = await roses.balanceOf(DexAddress);
            console.log(`Balance of token after is: ${balanceAfterToken}`);
            const comparison = balanceAfterToken < balanceBeforeToken;
            assert.isTrue(comparison);
        });
        it("Should increase deployer eth reserves", async function () {
            await dex.connect(deployer).deposit({ value: ethers.parseEther("5") });
            const balanceBeforeETH = await ethers.provider.getBalance(deployer.address);
            console.log(`Balance of eth before is: ${balanceBeforeETH}`);
            const value = ethers.parseEther("3");
            await dex.connect(deployer).withdraw(value);
            const balanceAfterETH = await ethers.provider.getBalance(deployer.address);
            console.log(`Balance of eth after is: ${balanceAfterETH}`);
            const comparison = balanceAfterETH > balanceBeforeETH;
            assert.isTrue(comparison);
        });

    });

});