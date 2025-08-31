document.addEventListener('DOMContentLoaded', () => {
    const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545');
    let signer;
    let contract;

    const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3'; // Replace with your contract address
    const contractABI = [
        "function registerPhoneNumber(address agency, string calldata phoneNumber, string calldata agencyName) external",
        "function revokePhoneNumber(address agency) external",
        "function verifyAgencyPhone(address agency, string calldata phoneNumber) external view returns (bool)",
        "event PhoneNumberRegistered(address indexed agency, string phoneNumber, string agencyName)",
        "event PhoneNumberRevoked(address indexed agency, string phoneNumber)"
    ];

    async function init() {
        await provider.send("eth_requestAccounts", []);
        signer = provider.getSigner();
        contract = new ethers.Contract(contractAddress, contractABI, signer);
    }

    init();

    const registerButton = document.getElementById('registerButton');
    const revokeButton = document.getElementById('revokeButton');
    const verifyButton = document.getElementById('verifyButton');
    const statusDiv = document.getElementById('status');

    registerButton.addEventListener('click', async () => {
        const agencyAddress = document.getElementById('registerAgencyAddress').value;
        const phoneNumber = document.getElementById('registerPhoneNumber').value;
        const agencyName = document.getElementById('registerAgencyName').value;
        statusDiv.textContent = 'Registering...';
        try {
            const tx = await contract.registerPhoneNumber(agencyAddress, phoneNumber, agencyName);
            await tx.wait();
            statusDiv.textContent = `Successfully registered ${agencyName} with phone number ${phoneNumber}.`;
        } catch (error) {
            statusDiv.textContent = `Error: ${error.message}`;
        }
    });

    revokeButton.addEventListener('click', async () => {
        const agencyAddress = document.getElementById('revokeAgencyAddress').value;
        statusDiv.textContent = 'Revoking...';
        try {
            const tx = await contract.revokePhoneNumber(agencyAddress);
            await tx.wait();
            statusDiv.textContent = `Successfully revoked phone number for agency ${agencyAddress}.`;
        } catch (error) {
            statusDiv.textContent = `Error: ${error.message}`;
        }
    });

    verifyButton.addEventListener('click', async () => {
        const agencyAddress = document.getElementById('verifyAgencyAddress').value;
        const phoneNumber = document.getElementById('verifyPhoneNumber').value;
        statusDiv.textContent = 'Verifying...';
        try {
            const isValid = await contract.verifyAgencyPhone(agencyAddress, phoneNumber);
            statusDiv.textContent = `Verification result: ${isValid}`;
        } catch (error) {
            statusDiv.textContent = `Error: ${error.message}`;
        }
    });
});
