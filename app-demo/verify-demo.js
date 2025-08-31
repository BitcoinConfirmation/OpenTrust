document.addEventListener('DOMContentLoaded', async () => {
    // Demo mode settings
    const DEMO_MODE = true; // Set to true to use local data instead of blockchain
    
    // Contract information
    const contractAddress = '0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0';
    
    // DOM elements
    const verifyButton = document.getElementById('verifyButton');
    const statusDiv = document.getElementById('status');
    const resultContainer = document.getElementById('result');
    const resultMessage = document.getElementById('result-message');
    const agencyDetails = document.getElementById('agency-details');
    const agencyName = document.getElementById('agency-name');
    const agencyPhone = document.getElementById('agency-phone');
    const resultIcon = document.querySelector('.result-icon .icon');
    
    // Debug elements
    const debugToggle = document.getElementById('debug-toggle');
    const debugInfo = document.getElementById('debug-info');
    const debugProvider = document.getElementById('debug-provider');
    const debugNetwork = document.getElementById('debug-network');
    const debugContract = document.getElementById('debug-contract');
    const debugAccount = document.getElementById('debug-account');
    const debugError = document.getElementById('debug-error');

    // Pre-populated test data for demo purposes
    const testData = [
        "+1-202-555-0101",
        "+1-202-555-0102",
        "+1-202-555-0103"
    ];
    
    // Demo registry data
    const demoRegistry = {
        "+1-202-555-0101": "Federal Bureau of Investigation",
        "+1-202-555-0102": "Department of Homeland Security",
        "+1-202-555-0103": "Internal Revenue Service"
    };

    // Add test phone numbers to the suggestion datalist
    const datalist = document.getElementById('phone-suggestions');
    testData.forEach(phone => {
        const option = document.createElement('option');
        option.value = phone;
        datalist.appendChild(option);
    });

    // Toggle debug info visibility
    debugToggle.addEventListener('click', () => {
        debugInfo.classList.toggle('hidden');
        debugToggle.textContent = debugInfo.classList.contains('hidden') 
            ? 'Show Debug Information' 
            : 'Hide Debug Information';
    });

    // Update debug info
    function updateDebugInfo(key, value) {
        const element = document.getElementById(`debug-${key}`);
        if (element) {
            // Extract label from existing text
            const label = element.textContent.split(':')[0];
            element.textContent = `${label}: ${value}`;
        }
    }

    // Initialize for demo mode
    if (DEMO_MODE) {
        setStatus('DEMO MODE - Using simulated verification', 'warning');
        updateDebugInfo('provider', 'Demo Mode (No blockchain connection)');
        updateDebugInfo('network', 'Local Demo');
        updateDebugInfo('contract', 'Simulated Contract');
        updateDebugInfo('account', 'None (Demo mode)');
    } else {
        // Blockchain connection would be initialized here in real mode
        setStatus('Error: Blockchain connection not available', 'error');
        updateDebugInfo('error', 'Blockchain connection not implemented in this demo');
    }
    
    // Verify phone number
    verifyButton.addEventListener('click', async () => {
        const phoneNumber = document.getElementById('verifyPhoneNumber').value;

        if (!phoneNumber) {
            setStatus('Please enter a phone number', 'error');
            return;
        }

        setStatus('Verifying phone number...', 'loading');
        resultContainer.classList.add('hidden');

        try {
            // Simulate verification delay
            await new Promise(resolve => setTimeout(resolve, 800));
            
            // Check if the phone number is in our demo registry
            const registeredAgency = demoRegistry[phoneNumber];
            const isVerified = !!registeredAgency;
            
            // Update debug info
            updateDebugInfo('provider', `Demo verification completed`);
            
            // Show result
            resultContainer.classList.remove('hidden');
            
            if (isVerified) {
                resultIcon.className = 'icon valid';
                resultMessage.textContent = `This is a verified trusted phone number.`;
                agencyName.textContent = registeredAgency;
                agencyPhone.textContent = phoneNumber;
                agencyDetails.classList.remove('hidden');
                setStatus('Verification completed successfully', 'success');
            } else {
                resultIcon.className = 'icon invalid';
                resultMessage.textContent = `This phone number is NOT registered with OpenTrust.`;
                agencyDetails.classList.add('hidden');
                setStatus('Verification completed - Number not found', 'error');
            }
        } catch (error) {
            console.error('Error verifying phone number:', error);
            updateDebugInfo('error', `Error: ${error.message}`);
            setStatus(`Error: ${error.message}`, 'error');
            resultContainer.classList.add('hidden');
        }
    });

    // Helper function to set status with appropriate styling
    function setStatus(message, type = '') {
        statusDiv.textContent = message;
        statusDiv.className = type;
        
        if (type === 'loading') {
            const loader = document.createElement('span');
            loader.className = 'loader';
            statusDiv.prepend(loader);
        }
        
        // Update debug error if it's an error
        if (type === 'error' && message.includes('Error')) {
            updateDebugInfo('error', message);
        }
    }
});
