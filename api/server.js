const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { body, param, validationResult } = require('express-validator');
const { ethers } = require('ethers');
const { contract } = require('./blockchain');
require('dotenv').config();

// Initialize Express app
const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Check if address is valid
const isValidAddress = (address) => {
  try {
    return ethers.utils.isAddress(address);
  } catch (error) {
    return false;
  }
};

// Routes

/**
 * @route   GET /api/health
 * @desc    API health check
 * @access  Public
 */
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'API is running' });
});

/**
 * @route   POST /api/register
 * @desc    Register a phone number for an agency
 * @access  Public (but requires owner authorization via blockchain)
 */
app.post('/api/register', [
  body('agency').custom(value => {
    if (!isValidAddress(value)) {
      throw new Error('Invalid Ethereum address');
    }
    return true;
  }),
  body('phoneNumber').notEmpty().withMessage('Phone number is required'),
  body('agencyName').notEmpty().withMessage('Agency name is required'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { agency, phoneNumber, agencyName } = req.body;
    
    // Register phone number
    const tx = await contract.registerPhoneNumber(agency, phoneNumber, agencyName);
    await tx.wait();
    
    res.status(201).json({ 
      success: true, 
      message: 'Phone number registered successfully',
      data: {
        agency,
        phoneNumber,
        agencyName,
        transactionHash: tx.hash
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Error registering phone number',
      error: error.reason || error.message
    });
  }
});

/**
 * @route   POST /api/revoke
 * @desc    Revoke a phone number from an agency
 * @access  Public (but requires owner authorization via blockchain)
 */
app.post('/api/revoke', [
  body('agency').custom(value => {
    if (!isValidAddress(value)) {
      throw new Error('Invalid Ethereum address');
    }
    return true;
  }),
  handleValidationErrors
], async (req, res) => {
  try {
    const { agency } = req.body;
    
    // Get the phone number before revocation for the response
    let phoneNumber;
    try {
      phoneNumber = await contract.getAgencyPhone(agency);
    } catch (error) {
      return res.status(400).json({ 
        success: false, 
        message: 'Agency does not have a registered phone number'
      });
    }
    
    // Revoke phone number
    const tx = await contract.revokePhoneNumber(agency);
    await tx.wait();
    
    res.status(200).json({ 
      success: true, 
      message: 'Phone number revoked successfully',
      data: {
        agency,
        phoneNumber,
        transactionHash: tx.hash
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Error revoking phone number',
      error: error.reason || error.message
    });
  }
});

/**
 * @route   GET /api/verify/:agency/:phoneNumber
 * @desc    Verify if a phone number belongs to an agency
 * @access  Public
 */
app.get('/api/verify/:agency/:phoneNumber', [
  param('agency').custom(value => {
    if (!isValidAddress(value)) {
      throw new Error('Invalid Ethereum address');
    }
    return true;
  }),
  param('phoneNumber').notEmpty().withMessage('Phone number is required'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { agency, phoneNumber } = req.params;
    
    // Verify phone number
    const isValid = await contract.verifyAgencyPhone(agency, phoneNumber);
    
    // If valid, get the agency name
    let agencyName = null;
    if (isValid) {
      try {
        agencyName = await contract.phoneToAgencyName(phoneNumber);
      } catch (error) {
        console.error('Error getting agency name:', error);
      }
    }
    
    res.status(200).json({ 
      success: true, 
      data: {
        agency,
        phoneNumber,
        isValid,
        agencyName
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Error verifying phone number',
      error: error.reason || error.message
    });
  }
});

/**
 * @route   GET /api/agency/:phoneNumber
 * @desc    Get agency name by phone number
 * @access  Public
 */
app.get('/api/agency/:phoneNumber', [
  param('phoneNumber').notEmpty().withMessage('Phone number is required'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { phoneNumber } = req.params;
    
    // Get agency name
    const agencyName = await contract.getAgencyNameByPhone(phoneNumber);
    
    res.status(200).json({ 
      success: true, 
      data: {
        phoneNumber,
        agencyName
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Error getting agency name',
      error: error.reason || error.message
    });
  }
});

/**
 * @route   GET /api/phone/:agency
 * @desc    Get phone number by agency address
 * @access  Public
 */
app.get('/api/phone/:agency', [
  param('agency').custom(value => {
    if (!isValidAddress(value)) {
      throw new Error('Invalid Ethereum address');
    }
    return true;
  }),
  handleValidationErrors
], async (req, res) => {
  try {
    const { agency } = req.params;
    
    // Get phone number
    const phoneNumber = await contract.getAgencyPhone(agency);
    
    res.status(200).json({ 
      success: true, 
      data: {
        agency,
        phoneNumber
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Error getting phone number',
      error: error.reason || error.message
    });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
