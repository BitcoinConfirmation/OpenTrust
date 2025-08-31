import { ethers } from "hardhat";

async function main() {
  console.log("Deploying GovernmentCallerRegistry...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const GovernmentCallerRegistry = await ethers.getContractFactory("GovernmentCallerRegistry");
  const registry = await GovernmentCallerRegistry.deploy();

  await registry.deployed();

  console.log("GovernmentCallerRegistry deployed to:", registry.address);
  console.log("Owner address:", await registry.owner());
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
