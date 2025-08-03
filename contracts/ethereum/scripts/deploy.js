const { ethers } = require("hardhat");

async function main() {
    console.log("🚀 Starting CosmosSwap Contract Deployment...");
    console.log("=" * 50);

    const [deployer] = await ethers.getSigners();
    console.log("📋 Deploying with account:", deployer.address);
    
    const balance = await deployer.getBalance();
    console.log("💰 Account balance:", ethers.utils.formatEther(balance), "ETH");

    if (balance.lt(ethers.utils.parseEther("0.01"))) {
        console.log("⚠️  Warning: Low balance. Make sure you have enough ETH for deployment.");
    }

    console.log("\n🔨 Deploying CosmosSwapEthereum contract...");

    // Deploy the contract
    const CosmosSwapEthereum = await ethers.getContractFactory("CosmosSwapEthereum");
    const cosmosSwap = await CosmosSwapEthereum.deploy();

    console.log("⏳ Waiting for deployment...");
    await cosmosSwap.deployed();

    console.log("\n🎉 Deployment successful!");
    console.log("📍 Contract address:", cosmosSwap.address);
    console.log("🔗 Transaction hash:", cosmosSwap.deployTransaction.hash);
    console.log("⛽ Gas used:", cosmosSwap.deployTransaction.gasLimit.toString());

    // Wait for block confirmations
    console.log("\n⏳ Waiting for block confirmations...");
    await cosmosSwap.deployTransaction.wait(5);

    // Verify contract on Etherscan if not localhost
    if (network.name !== "hardhat" && network.name !== "localhost") {
        console.log("\n🔍 Verifying contract on Etherscan...");
        try {
            await hre.run("verify:verify", {
                address: cosmosSwap.address,
                constructorArguments: [],
            });
            console.log("✅ Contract verified successfully!");
        } catch (error) {
            console.log("❌ Verification failed:", error.message);
        }
    }

    // Test basic functionality
    console.log("\n🧪 Testing basic contract functionality...");
    try {
        const minimumTimelock = await cosmosSwap.MINIMUM_TIMELOCK();
        const maximumTimelock = await cosmosSwap.MAXIMUM_TIMELOCK();
        
        console.log("✅ Minimum timelock:", minimumTimelock.toString(), "seconds");
        console.log("✅ Maximum timelock:", maximumTimelock.toString(), "seconds");
        
        console.log("✅ Contract is working correctly!");
    } catch (error) {
        console.log("❌ Contract test failed:", error.message);
    }

    // Save deployment info
    const deploymentInfo = {
        network: network.name,
        contractAddress: cosmosSwap.address,
        transactionHash: cosmosSwap.deployTransaction.hash,
        blockNumber: cosmosSwap.deployTransaction.blockNumber,
        gasUsed: cosmosSwap.deployTransaction.gasLimit.toString(),
        timestamp: new Date().toISOString(),
        deployer: deployer.address
    };

    console.log("\n📝 Deployment Summary:");
    console.log(JSON.stringify(deploymentInfo, null, 2));

    // Update frontend config
    console.log("\n🔧 Update your frontend .env file with:");
    console.log(`VITE_ETHEREUM_CONTRACT_ADDRESS=${cosmosSwap.address}`);

    return cosmosSwap.address;
}

main()
    .then(() => {
        console.log("\n🎊 Deployment completed successfully!");
        process.exit(0);
    })
    .catch((error) => {
        console.error("\n💥 Deployment failed:", error);
        process.exit(1);
    });