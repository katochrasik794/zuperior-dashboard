// zuperior-dashboard/server/src/routes/mt5.routes.js

import express from 'express';
import * as mt5Controller from '../controllers/mt5.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

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

// Get all MT5 accounts for a user (Protected)
router.get('/mt5/user-accounts', protect, mt5Controller.getUserAccounts);

export default router;