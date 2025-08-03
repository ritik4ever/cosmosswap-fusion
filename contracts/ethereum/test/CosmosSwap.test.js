const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("CosmosSwapEthereum", function () {
  let cosmosSwap;
  let owner;
  let addr1;
  let addr2;
  let token;

  const hashlock = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("secret123"));
  const secret = ethers.utils.toUtf8Bytes("secret123");

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy mock ERC20 token
    const Token = await ethers.getContractFactory("MockERC20");
    token = await Token.deploy("Test Token", "TEST", 18);
    await token.deployed();

    // Deploy CosmosSwap contract
    const CosmosSwapEthereum = await ethers.getContractFactory("CosmosSwapEthereum");
    cosmosSwap = await CosmosSwapEthereum.deploy();
    await cosmosSwap.deployed();

    // Mint tokens to addr1
    await token.mint(addr1.address, ethers.utils.parseEther("1000"));
  });

  describe("Deployment", function () {
    it("Should deploy successfully", async function () {
      expect(cosmosSwap.address).to.not.equal(ethers.constants.AddressZero);
    });
  });

  describe("ETH Swaps", function () {
    it("Should initiate ETH swap successfully", async function () {
      const amount = ethers.utils.parseEther("1");
      const timelock = (await time.latest()) + 3600; // 1 hour from now

      await expect(
        cosmosSwap.connect(addr1).initiateSwap(
          hashlock,
          timelock,
          addr2.address,
          ethers.constants.AddressZero, // ETH
          amount,
          { value: amount }
        )
      ).to.emit(cosmosSwap, "SwapInitiated");
    });

    it("Should allow withdrawal with correct preimage", async function () {
      const amount = ethers.utils.parseEther("1");
      const timelock = (await time.latest()) + 3600;

      const tx = await cosmosSwap.connect(addr1).initiateSwap(
        hashlock,
        timelock,
        addr2.address,
        ethers.constants.AddressZero,
        amount,
        { value: amount }
      );

      const receipt = await tx.wait();
      const swapId = receipt.events[0].args.swapId;

      const balanceBefore = await addr2.getBalance();
      
      await cosmosSwap.connect(addr2).withdraw(swapId, secret);
      
      const balanceAfter = await addr2.getBalance();
      expect(balanceAfter.sub(balanceBefore)).to.be.closeTo(amount, ethers.utils.parseEther("0.01"));
    });

    it("Should allow refund after timelock expiry", async function () {
      const amount = ethers.utils.parseEther("1");
      const timelock = (await time.latest()) + 3600;

      const tx = await cosmosSwap.connect(addr1).initiateSwap(
        hashlock,
        timelock,
        addr2.address,
        ethers.constants.AddressZero,
        amount,
        { value: amount }
      );

      const receipt = await tx.wait();
      const swapId = receipt.events[0].args.swapId;

      // Fast forward past timelock
      await time.increaseTo(timelock + 1);

      const balanceBefore = await addr1.getBalance();
      await cosmosSwap.connect(addr1).refund(swapId);
      const balanceAfter = await addr1.getBalance();

      expect(balanceAfter.sub(balanceBefore)).to.be.closeTo(amount, ethers.utils.parseEther("0.01"));
    });
  });

  describe("ERC20 Swaps", function () {
    it("Should initiate ERC20 swap successfully", async function () {
      const amount = ethers.utils.parseEther("100");
      const timelock = (await time.latest()) + 3600;

      // Approve token transfer
      await token.connect(addr1).approve(cosmosSwap.address, amount);

      await expect(
        cosmosSwap.connect(addr1).initiateSwap(
          hashlock,
          timelock,
          addr2.address,
          token.address,
          amount
        )
      ).to.emit(cosmosSwap, "SwapInitiated");
    });
  });

  describe("Security Tests", function () {
    it("Should reject swaps with invalid timelock", async function () {
      const amount = ethers.utils.parseEther("1");
      const shortTimelock = (await time.latest()) + 1800; // 30 minutes (too short)

      await expect(
        cosmosSwap.connect(addr1).initiateSwap(
          hashlock,
          shortTimelock,
          addr2.address,
          ethers.constants.AddressZero,
          amount,
          { value: amount }
        )
      ).to.be.revertedWith("Timelock too short");
    });

    it("Should reject withdrawal with wrong preimage", async function () {
      const amount = ethers.utils.parseEther("1");
      const timelock = (await time.latest()) + 3600;

      const tx = await cosmosSwap.connect(addr1).initiateSwap(
        hashlock,
        timelock,
        addr2.address,
        ethers.constants.AddressZero,
        amount,
        { value: amount }
      );

      const receipt = await tx.wait();
      const swapId = receipt.events[0].args.swapId;

      const wrongSecret = ethers.utils.toUtf8Bytes("wrongsecret");

      await expect(
        cosmosSwap.connect(addr2).withdraw(swapId, wrongSecret)
      ).to.be.revertedWith("Invalid preimage");
    });
  });
});