const { ethers } = require("hardhat");

async function main() {
  // Get the contract
  const contractAddress = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";
  const [owner, agency1, agency2] = await ethers.getSigners();
  
  const contractABI = [
    "function registerPhoneNumber(address agency, string calldata phoneNumber, string calldata agencyName) external",
    "function getAgencyNameByPhone(string calldata phoneNumber) external view returns (string)"
  ];
  
  const contract = new ethers.Contract(contractAddress, contractABI, owner);
  
  console.log("Registering phone numbers...");
  
  // Register some test phone numbers
  try {
    const tx1 = await contract.registerPhoneNumber(
      agency1.address,
      "+1-202-555-0101",
      "Federal Bureau of Investigation"
    );
    await tx1.wait();
    console.log("Registered +1-202-555-0101 for FBI");
    
    const tx2 = await contract.registerPhoneNumber(
      agency2.address,
      "+1-202-555-0102",
      "Department of Homeland Security"
    );
    await tx2.wait();
    console.log("Registered +1-202-555-0102 for DHS");
    
    // Verify the registrations
    const fbiName = await contract.getAgencyNameByPhone("+1-202-555-0101");
    const dhsName = await contract.getAgencyNameByPhone("+1-202-555-0102");
    
    console.log("Verification:");
    console.log(`Phone +1-202-555-0101 is registered to: ${fbiName}`);
    console.log(`Phone +1-202-555-0102 is registered to: ${dhsName}`);
    
    console.log("Phone numbers registered successfully!");
  } catch (error) {
    console.error("Error registering phone numbers:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
