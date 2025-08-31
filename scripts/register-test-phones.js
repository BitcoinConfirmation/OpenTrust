// Script to register test phone numbers on the local blockchain
// Run with: node scripts/register-test-phones.js

const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

// Configuration
const contractAddress = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9"; // Update with your deployed contract address
const providerUrl = "http://localhost:8545";
const privateKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"; // Hardhat first account

// Test data to register
const testPhones = [
    { phone: "+1-202-555-0101", agency: "Federal Bureau of Investigation" },
    { phone: "+1-202-555-0102", agency: "Department of Homeland Security" },
    { phone: "+1-202-555-0103", agency: "Internal Revenue Service" },
];

// Read contract ABI (from artifacts)
let contractABI;
try {
    const artifactPath = path.join(__dirname, "../artifacts/contracts/GovernmentCallerRegistry.sol/GovernmentCallerRegistry.json");
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    contractABI = artifact.abi;
    console.log("ABI loaded successfully");
} catch (error) {
    console.error("Error loading contract ABI:", error.message);
    console.log("Using minimal ABI instead");
    contractABI = [
        "function registerAgency(string memory agencyName) external",
        "function registerPhoneNumber(string memory phoneNumber) external",
        "function verifyAgencyPhone(string memory phoneNumber) external view returns (bool)",
        "function getAgencyNameByPhone(string calldata phoneNumber) external view returns (string)",
        "function owner() external view returns (address)"
    ];
}

async function main() {
    try {
        console.log("Connecting to local blockchain at", providerUrl);
        const provider = new ethers.providers.JsonRpcProvider(providerUrl);
        
        // Check connection
        try {
            const blockNumber = await provider.getBlockNumber();
            console.log(`Successfully connected to blockchain. Current block: ${blockNumber}`);
        } catch (error) {
            console.error("Failed to connect to blockchain:", error.message);
            process.exit(1);
        }
        
        // Setup wallet with private key
        const wallet = new ethers.Wallet(privateKey, provider);
        const walletAddress = await wallet.getAddress();
        console.log(`Using wallet address: ${walletAddress}`);
        
        // Get balance
        const balance = await provider.getBalance(walletAddress);
        console.log(`Wallet balance: ${ethers.utils.formatEther(balance)} ETH`);
        
        // Connect to contract
        const contract = new ethers.Contract(contractAddress, contractABI, wallet);
        
        // Verify contract exists
        const code = await provider.getCode(contractAddress);
        if (code === '0x') {
            console.error(`No contract deployed at address ${contractAddress}`);
            process.exit(1);
        }
        
        // Verify we're the owner
        try {
            const owner = await contract.owner();
            if (owner.toLowerCase() !== walletAddress.toLowerCase()) {
                console.warn(`Warning: You are not the contract owner. Owner is ${owner}`);
            } else {
                console.log("You are the contract owner. Proceeding with registration.");
            }
        } catch (error) {
            console.warn("Could not verify ownership:", error.message);
        }
        
        // Register each test phone
        for (const { phone, agency } of testPhones) {
            console.log(`\nRegistering ${phone} for ${agency}...`);
            
            // Check if phone is already registered
            try {
                const isRegistered = await contract.verifyAgencyPhone(phone);
                if (isRegistered) {
                    console.log(`Phone ${phone} is already registered. Skipping.`);
                    continue;
                }
            } catch (error) {
                // If verifyAgencyPhone fails, it might not be registered
                console.log(`Could not verify if phone is registered: ${error.message}`);
            }
            
            try {
                // First register the agency
                console.log(`Registering agency: ${agency}`);
                const agencyTx = await contract.registerAgency(agency);
                await agencyTx.wait();
                console.log(`Agency registered: ${agency} (tx: ${agencyTx.hash})`);
                
                // Then register the phone number
                console.log(`Registering phone: ${phone}`);
                const phoneTx = await contract.registerPhoneNumber(phone);
                await phoneTx.wait();
                console.log(`Phone registered: ${phone} (tx: ${phoneTx.hash})`);
                
                console.log(`Successfully registered ${phone} for ${agency}`);
            } catch (error) {
                console.error(`Error registering ${phone}:`, error.message);
                // Continue with next phone
            }
        }
        
        console.log("\nRegistration process completed.");
        
        // Verify all phones
        console.log("\nVerifying all registered phones:");
        for (const { phone, agency } of testPhones) {
            try {
                const registeredAgency = await contract.getAgencyNameByPhone(phone);
                console.log(`${phone}: ${registeredAgency ? `✓ Registered to ${registeredAgency}` : '✗ Not registered'}`);
            } catch (error) {
                console.log(`${phone}: ✗ Error checking (${error.message})`);
            }
        }
        
    } catch (error) {
        console.error("Unexpected error:", error);
    }
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error("Fatal error:", error);
        process.exit(1);
    });
