// zuperior-dashboard/server/src/routes/mt5.routes.js

const express = require('express');
const router = express.Router();
const mt5Controller = require('../controllers/mt5.controller');
const { protect } = require('../middleware/auth.middleware'); // Assuming MT5 routes need protection

// --- Public MT5 Routes ---
// 4.1 Get Groups API - Used during the account creation flow
router.get('/mt5/groups', mt5Controller.getGroups);

// --- Protected MT5 Routes (Require Authentication) ---
// We'll use the protect middleware for routes that interact with a specific user's account

// 4.2 Open MT5 Account API (Protected because it links to a CRM user)
router.post('/mt5/create-account', protect, mt5Controller.createAccount);

// 4.3 Deposit API (Protected)
router.post('/mt5/deposit', protect, mt5Controller.deposit);

// 4.4 Withdraw API (Protected)
router.post('/mt5/withdraw', protect, mt5Controller.withdraw);

// 4.5 Get User Profile (Protected - Fetching user-specific data)
router.get('/mt5/user-profile/:login', protect, mt5Controller.getUserProfile);


module.exports = router;