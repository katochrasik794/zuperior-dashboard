// zuperior-dashboard/server/src/services/mt5.service.js (New File)

import axios from 'axios';

// MT5 Manager API Base URL from your documentation
const MT5_BASE_URL = 'http://18.130.5.209:5003/api';

/**
 * Executes a request to the MT5 Manager API.
 * @param {string} method - HTTP method (GET, POST).
 * @param {string} endpoint - The specific API path (e.g., 'Groups', 'Users').
 * @param {object} data - Request body data (for POST).
 */
const mt5Request = async (method, endpoint, data = null) => {
    try {
        const url = `${MT5_BASE_URL}/${endpoint}`;

        const response = await axios({
            method: method.toLowerCase(),
            url: url,
            data: data,
            headers: {
                'Content-Type': 'application/json',
                // Assuming no specific Authorization header is required for this setup,
                // but if it is, add it here (e.g., Authorization: 'Bearer XXX')
            }
        });

        // The MT5 API returns data wrapped in { Success, Message, Data, Error }
        if (response.data && response.data.Success === true) {
            return response.data.Data; // Return the 'Data' field on success
        } else if (response.data && response.data.Error !== null) {
            // Handle specific MT5 error messages
            throw new Error(`MT5 API Error: ${response.data.Message || JSON.stringify(response.data.Error)}`);
        } else {
            // Handle unexpected response structure
            throw new Error('MT5 API returned a non-successful or invalid response.');
        }

    } catch (error) {
        // Handle network errors (e.g., MT5 server is down or unreachable)
        const errorMessage = error.response
            ? `MT5 HTTP Error ${error.response.status}: ${error.response.statusText}`
            : error.message;

        throw new Error(`Failed to communicate with MT5 Manager: ${errorMessage}`);
    }
};

// --- Exported Functions matching your Roadmap ---

// 4.1 Get Groups API
export const getMt5Groups = () => {
    return mt5Request('GET', 'groups');
};

// 4.2 Open MT5 Account API
export const openMt5Account = (userData) => {
    // Endpoint is '/api/Users' for account creation
    return mt5Request('POST', 'Users', userData);
};

// 4.3 Deposit (Add Balance)
export const depositMt5Balance = (login, amount, comment) => {
    const endpoint = `Users/${login}/AddClientBalance`;
    return mt5Request('POST', endpoint, { balance: amount, comment });
};

// 4.4 Withdraw (Deduct Balance)
export const withdrawMt5Balance = (login, amount, comment) => {
    const endpoint = `Users/${login}/DeductClientBalance`;
    // Note: DeductClientBalance usually takes a positive amount to deduct
    return mt5Request('POST', endpoint, { balance: amount, comment });
};

// 4.5 Get User Profile
export const getMt5UserProfile = (login) => {
    const endpoint = `Users/${login}/getClientProfile`;
    return mt5Request('GET', endpoint);
};