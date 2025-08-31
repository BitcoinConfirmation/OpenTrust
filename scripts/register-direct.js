// register-direct.js - Direct registration of phone numbers without using the higher-level functions
// This script works with the actual contract interface

const { ethers } = require("hardhat");

async function main() {
  console.log("Registering test phone numbers directly...");

  // Get the first signer (deployer account)
  const [owner] = await ethers.getSigners();
  console.log(`Using account: ${owner.address}`);

  // Get the deployed contract instance
  const GovernmentCallerRegistry = await ethers.getContractFactory("GovernmentCallerRegistry");
  const registry = await GovernmentCallerRegistry.attach("0xa513E6E4b8f2a923D98304ec87F64353C4D5C853");
  
  // Test data to register
  const testData = [
    { phone: "+1-202-555-0101", agency: "Federal Bureau of Investigation" },
    { phone: "+1-202-555-0102", agency: "Department of Homeland Security" },
    { phone: "+1-202-555-0103", agency: "Internal Revenue Service" },
  ];

  // Register each agency and phone number
  for (const { phone, agency } of testData) {
    console.log(`Registering ${phone} for ${agency}...`);
    
    try {
      // Register the phone number with the agency name
      const tx = await registry.registerPhoneNumber(phone, agency);
      await tx.wait();
      console.log(`Successfully registered ${phone} for ${agency} (tx: ${tx.hash})`);
    } catch (error) {
      console.error(`Error registering ${phone}:`, error.message);
    }
  }

  // Verify all phones
  console.log("\nVerifying all registered phones:");
  for (const { phone, agency } of testData) {
    try {
      // Check if each phone is registered
      const registeredAgency = await registry.phoneToAgencyName(phone);
      console.log(`${phone}: ${registeredAgency ? `✓ Registered to ${registeredAgency}` : '✗ Not registered'}`);
    } catch (error) {
      console.log(`${phone}: ✗ Error checking (${error.message})`);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
