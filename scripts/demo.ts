import { ethers } from "hardhat";

async function main() {
  console.log("Running GovernmentCallerRegistry Demo...");

  // Get signers for demo
  const [owner, agency1, agency2, caller] = await ethers.getSigners();
  
  console.log("Owner:", owner.address);
  console.log("Agency 1:", agency1.address);
  console.log("Agency 2:", agency2.address);
  console.log("External Caller:", caller.address);
  
  // Deploy the contract
  const GovernmentCallerRegistry = await ethers.getContractFactory("GovernmentCallerRegistry");
  const registry = await GovernmentCallerRegistry.deploy();
  await registry.deployed();
  
  console.log("\nGovernmentCallerRegistry deployed to:", registry.address);
  
  // Demonstrate phone number registration
  console.log("\n--- Registering Phone Numbers ---");
  let tx = await registry.registerPhoneNumber(agency1.address, "+61000000", "Department of Example");
  await tx.wait();
  console.log("Registered +61000000 for Department of Example");
  
  tx = await registry.registerPhoneNumber(agency2.address, "+61111111", "Ministry of Testing");
  await tx.wait();
  console.log("Registered +61111111 for Ministry of Testing");
  
  // Demonstrate querying agency information
  console.log("\n--- Querying Agency Information ---");
  console.log("Agency name for phone +61000000:", await registry.getAgencyNameByPhone("+61000000"));
  console.log("Agency name for phone +61111111:", await registry.getAgencyNameByPhone("+61111111"));
  console.log("Phone number for Agency 1:", await registry.getAgencyPhone(agency1.address));
  console.log("Phone number for Agency 2:", await registry.getAgencyPhone(agency2.address));
  
  // Demonstrate phone verification
  console.log("\n--- Verifying Phone Numbers ---");
  
  // Valid verification
  let isValid = await registry.verifyAgencyPhone(agency1.address, "+61000000");
  console.log("Is +61000000 registered to Agency 1?", isValid);
  
  // Invalid verification (wrong phone)
  isValid = await registry.verifyAgencyPhone(agency1.address, "+61111111");
  console.log("Is +61111111 registered to Agency 1?", isValid);
  
  // Unregistered agency verification
  isValid = await registry.verifyAgencyPhone(caller.address, "+61000000");
  console.log("Is +61000000 registered to External Caller?", isValid);
  
  // Demonstrate access control
  console.log("\n--- Demonstrating Access Control ---");
  try {
    // Connecting as non-owner and trying to register a phone number
    await registry.connect(caller).registerPhoneNumber(caller.address, "+61222222", "Unauthorized Department");
  } catch (error) {
    console.log("Expected error when non-owner tries to register: Caller is not the owner");
  }
  
  // Demonstrate error handling for queries
  console.log("\n--- Error Handling ---");
  try {
    // Trying to get an unregistered phone number
    await registry.getAgencyNameByPhone("+61999999");
  } catch (error) {
    console.log("Expected error for unregistered phone: Phone number not registered");
  }
  
  try {
    // Trying to get phone for an unregistered agency
    await registry.getAgencyPhone(caller.address);
  } catch (error) {
    console.log("Expected error for unregistered agency: Phone number not registered for this agency");
  }
  
  console.log("\nDemo completed successfully!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
