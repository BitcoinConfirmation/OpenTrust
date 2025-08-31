// register-fixed.js - Registration script that matches the actual contract interface
// This script registers phone numbers with agency addresses

const { ethers } = require("hardhat");

async function main() {
  console.log("Registering test phone numbers with correct interface...");

  // Get the first signer (deployer account)
  const [owner, addr1, addr2, addr3] = await ethers.getSigners();
  console.log(`Using owner account: ${owner.address}`);

  // Get the deployed contract instance
  const GovernmentCallerRegistry = await ethers.getContractFactory("GovernmentCallerRegistry");
  const registry = await GovernmentCallerRegistry.attach("0xa513E6E4b8f2a923D98304ec87F64353C4D5C853");
  
  // Test data to register - using different addresses for each agency
  const testData = [
    { phone: "+1-202-555-0101", agency: addr1.address, name: "Federal Bureau of Investigation" },
    { phone: "+1-202-555-0102", agency: addr2.address, name: "Department of Homeland Security" },
    { phone: "+1-202-555-0103", agency: addr3.address, name: "Internal Revenue Service" },
  ];

  // Register each agency and phone number
  for (const { phone, agency, name } of testData) {
    console.log(`Registering ${phone} for ${name} (${agency})...`);
    
    try {
      // Check if already registered
      try {
        const existingPhone = await registry.getAgencyPhone(agency);
        console.log(`Agency ${agency} already has phone ${existingPhone} registered. Skipping.`);
        continue;
      } catch (error) {
        // This is expected if not registered yet
        if (!error.message.includes("Phone number not registered")) {
          console.error(`Unexpected error checking registration:`, error.message);
        }
      }

      // Register the phone number with the agency address and name
      const tx = await registry.registerPhoneNumber(agency, phone, name);
      await tx.wait();
      console.log(`Successfully registered ${phone} for ${name} (tx: ${tx.hash})`);
    } catch (error) {
      console.error(`Error registering ${phone}:`, error.message);
    }
  }

  // Verify all phones
  console.log("\nVerifying all registered phones by phone number:");
  for (const { phone, name } of testData) {
    try {
      const registeredName = await registry.phoneToAgencyName(phone);
      console.log(`${phone}: ${registeredName ? `✓ Registered to ${registeredName}` : '✗ Not registered'}`);
    } catch (error) {
      console.log(`${phone}: ✗ Error checking (${error.message})`);
    }
  }

  console.log("\nVerifying all agencies by address:");
  for (const { agency, name } of testData) {
    try {
      const registeredPhone = await registry.agencyToPhone(agency);
      console.log(`${name} (${agency.substring(0, 8)}...): ${registeredPhone ? `✓ Phone: ${registeredPhone}` : '✗ Not registered'}`);
    } catch (error) {
      console.log(`${agency.substring(0, 8)}...: ✗ Error checking (${error.message})`);
    }
  }

  // Save the test data to a file for the UI to use
  console.log("\nTest data for verification:");
  for (const { phone, agency, name } of testData) {
    console.log(`- To verify ${name}: use phone ${phone} and agency address ${agency}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
