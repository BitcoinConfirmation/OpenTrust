import { expect } from "chai";
import { ethers } from "hardhat";
import { GovernmentCallerRegistry } from "../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("GovernmentCallerRegistry", function () {
  let registry: GovernmentCallerRegistry;
  let owner: SignerWithAddress;
  let agency1: SignerWithAddress;
  let agency2: SignerWithAddress;
  let caller: SignerWithAddress;

  beforeEach(async function () {
    // Get signers
    [owner, agency1, agency2, caller] = await ethers.getSigners();
    
    // Deploy the contract
    const GovernmentCallerRegistry = await ethers.getContractFactory("GovernmentCallerRegistry");
    registry = await GovernmentCallerRegistry.deploy();
    await registry.deployed();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await registry.owner()).to.equal(owner.address);
    });
  });

  describe("Phone Number Registration", function () {
    it("Should register a phone number for an agency", async function () {
      await registry.registerPhoneNumber(agency1.address, "+61000000", "Department of Example");
      
      expect(await registry.phoneToAgencyName("+61000000")).to.equal("Department of Example");
      expect(await registry.agencyToPhone(agency1.address)).to.equal("+61000000");
      expect(await registry.getAgencyNameByPhone("+61000000")).to.equal("Department of Example");
      expect(await registry.getAgencyPhone(agency1.address)).to.equal("+61000000");
    });

    it("Should fail if non-owner tries to register a phone number", async function () {
      await expect(
        registry.connect(caller).registerPhoneNumber(caller.address, "+61999999", "Unauthorized Department")
      ).to.be.revertedWith("Caller is not the owner");
    });

    it("Should fail to register an already registered phone number", async function () {
      await registry.registerPhoneNumber(agency1.address, "+61000000", "Department of Example");
      
      await expect(
        registry.registerPhoneNumber(agency2.address, "+61000000", "Another Department")
      ).to.be.revertedWith("Phone number already registered");
    });

    it("Should fail to register a phone number for an already registered agency", async function () {
      await registry.registerPhoneNumber(agency1.address, "+61000000", "Department of Example");
      
      await expect(
        registry.registerPhoneNumber(agency1.address, "+61111111", "Department of Example")
      ).to.be.revertedWith("Agency already has a registered phone number");
    });

    it("Should fail to get phone for an unregistered agency", async function () {
      await expect(
        registry.getAgencyPhone(agency1.address)
      ).to.be.revertedWith("Phone number not registered for this agency");
    });

    it("Should fail to get unregistered phone number", async function () {
      await expect(
        registry.getAgencyNameByPhone("+61999999")
      ).to.be.revertedWith("Phone number not registered");
    });
  });

  describe("Phone Verification", function () {
    beforeEach(async function () {
      // Register phone numbers for testing
      await registry.registerPhoneNumber(agency1.address, "+61000000", "Department of Example");
      await registry.registerPhoneNumber(agency2.address, "+61111111", "Ministry of Testing");
    });

    it("Should verify a correct phone number for an agency", async function () {
      expect(await registry.verifyAgencyPhone(agency1.address, "+61000000")).to.be.true;
      expect(await registry.verifyAgencyPhone(agency2.address, "+61111111")).to.be.true;
    });

    it("Should return false for an incorrect phone number", async function () {
      expect(await registry.verifyAgencyPhone(agency1.address, "+61111111")).to.be.false;
      expect(await registry.verifyAgencyPhone(agency2.address, "+61000000")).to.be.false;
    });

    it("Should return false for an unregistered agency", async function () {
      expect(await registry.verifyAgencyPhone(caller.address, "+61000000")).to.be.false;
    });
  });

  describe("Ownership", function () {
    it("Should transfer ownership", async function () {
      await registry.transferOwnership(agency1.address);
      expect(await registry.owner()).to.equal(agency1.address);
    });

    it("Should fail if non-owner tries to transfer ownership", async function () {
      await expect(
        registry.connect(caller).transferOwnership(agency1.address)
      ).to.be.revertedWith("Caller is not the owner");
    });
  });
});
