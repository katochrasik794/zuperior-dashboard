// zuperior-dashboard/server/src/controllers/mt5.controller.js

import * as mt5Service from '../services/mt5.service.js';
import prisma from '../services/db.service.js';

// 4.1 GET /api/mt5/groups
export const getGroups = async (req, res) => {
    try {
        // Call the MT5 Service to fetch all groups
        const groups = await mt5Service.getMt5Groups();

        // Return the RAW data. The filtering logic is handled in the Next.js API Proxy,
        // as per the initial design for that specific route.
        res.json(groups);
    } catch (error) {
        console.error("Error in getGroups controller:", error.message);
        // Forward the error message from the service layer to the client
        res.status(500).json({ message: error.message });
    }
};

// 4.2 POST /api/mt5/create-account
export const createAccount = async (req, res) => {
    try {
        const {
            name,
            group,
            leverage = 100,
            masterPassword,
            investorPassword,
            email,
            country,
            city,
            phone,
            comment
        } = req.body;

        // Get user ID from authenticated request
        const userId = req.user.id;

        // Validate required fields
        if (!name || !group || !masterPassword || !investorPassword) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: name, group, masterPassword, investorPassword'
            });
        }

        // Validate group is one of the allowed groups
        const allowedGroups = [
            'real\\Bbook\\Pro\\dynamic-2000x-10P',
            'real\\Bbook\\Standard\\dynamic-2000x-20Pips'
        ];

        if (!allowedGroups.includes(group)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid group. Only Pro and Standard accounts are allowed.'
            });
        }

        // Prepare MT5 account data
        const mt5AccountData = {
            name,
            group,
            leverage,
            masterPassword,
            investorPassword,
            password: masterPassword, // Legacy field
            email: email || '',
            country: country || '',
            city: city || '',
            phone: phone || '',
            comment: comment || 'Created from CRM'
        };

        // Call MT5 API to create account
        const mt5Response = await mt5Service.openMt5Account(mt5AccountData);

        if (!mt5Response.Success) {
            return res.status(400).json({
                success: false,
                message: mt5Response.Message || 'Failed to create MT5 account'
            });
        }

        const mt5Data = mt5Response.Data;
        const mt5Login = mt5Data.Login;

        // Store account in database
        const newAccount = await prisma.MT5Account.create({
            data: {
                accountId: mt5Login.toString(),
                leverage: parseInt(leverage),
                balance: parseFloat(mt5Data.Balance || 0),
                equity: parseFloat(mt5Data.Equity || 0),
                credit: parseFloat(mt5Data.Credit || 0),
                margin: parseFloat(mt5Data.Margin || 0),
                marginFree: parseFloat(mt5Data.MarginFree || 0),
                marginLevel: parseFloat(mt5Data.MarginLevel || 0),
                profit: parseFloat(mt5Data.Profit || 0),
                groupName: mt5Data.Group,
                isEnabled: mt5Data.IsEnabled,
                userId: userId,
                name: name,
                email: email || '',
                country: country || '',
                phone: phone || ''
            }
        });

        res.json({
            success: true,
            message: 'MT5 account created successfully',
            data: {
                mt5Login: mt5Login,
                accountId: newAccount.id,
                balance: newAccount.balance,
                equity: newAccount.equity,
                group: newAccount.groupName
            }
        });

    } catch (error) {
        console.error('Error creating MT5 account:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Internal server error'
        });
    }
};

// 4.3 POST /api/mt5/deposit
export const deposit = async (req, res) => {
    try {
        const { login, balance, comment } = req.body;

        // Get user ID from authenticated request
        const userId = req.user.id;

        // Validate required fields
        if (!login || !balance || balance <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Missing or invalid fields: login, balance (must be > 0)'
            });
        }

        // Verify the MT5 account belongs to the authenticated user
        const account = await prisma.MT5Account.findFirst({
            where: {
                accountId: login.toString(),
                userId: userId
            }
        });

        if (!account) {
            return res.status(404).json({
                success: false,
                message: 'MT5 account not found or access denied'
            });
        }

        // Call MT5 API to add balance
        const mt5Response = await mt5Service.depositMt5Balance(login, balance, comment || 'Deposit via CRM');

        if (!mt5Response.Success) {
            return res.status(400).json({
                success: false,
                message: mt5Response.Message || 'Failed to deposit to MT5 account'
            });
        }

        const mt5Data = mt5Response.Data;

        // Update account balance in database
        const updatedAccount = await prisma.MT5Account.update({
            where: { id: account.id },
            data: {
                balance: parseFloat(mt5Data.Balance),
                equity: parseFloat(mt5Data.Equity),
                marginFree: parseFloat(mt5Data.MarginFree),
                updatedAt: new Date()
            }
        });

        // Create transaction record
        await prisma.MT5Transaction.create({
            data: {
                type: 'Deposit',
                amount: parseFloat(balance),
                status: 'completed',
                comment: comment || 'Deposit via CRM',
                mt5AccountId: account.id,
                transactionId: `DEP_${Date.now()}_${login}`
            }
        });

        res.json({
            success: true,
            message: 'Deposit successful',
            data: {
                login: login,
                amount: balance,
                newBalance: updatedAccount.balance,
                newEquity: updatedAccount.equity
            }
        });

    } catch (error) {
        console.error('Error depositing to MT5 account:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Internal server error'
        });
    }
};

// Additional method: Get all MT5 accounts for a user
export const getUserAccounts = async (req, res) => {
    try {
        const userId = req.user.id;

        const accounts = await prisma.MT5Account.findMany({
            where: { userId: userId },
            orderBy: { createdAt: 'desc' }
        });

        res.json({
            success: true,
            message: 'User accounts retrieved successfully',
            data: {
                accounts: accounts.map(account => ({
                    id: account.id,
                    accountId: account.accountId,
                    name: account.name,
                    group: account.groupName,
                    leverage: account.leverage,
                    balance: account.balance,
                    equity: account.equity,
                    credit: account.credit,
                    margin: account.margin,
                    marginFree: account.marginFree,
                    marginLevel: account.marginLevel,
                    profit: account.profit,
                    isEnabled: account.isEnabled,
                    createdAt: account.createdAt,
                    updatedAt: account.updatedAt
                }))
            }
        });

    } catch (error) {
        console.error('Error fetching user MT5 accounts:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Internal server error'
        });
    }
};

// 4.4 POST /api/mt5/withdraw
export const withdraw = async (req, res) => {
    try {
        const { login, balance, comment } = req.body;

        // Get user ID from authenticated request
        const userId = req.user.id;

        // Validate required fields
        if (!login || !balance || balance <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Missing or invalid fields: login, balance (must be > 0)'
            });
        }

        // Verify the MT5 account belongs to the authenticated user and get current balance
        const account = await prisma.MT5Account.findFirst({
            where: {
                accountId: login.toString(),
                userId: userId
            }
        });

        if (!account) {
            return res.status(404).json({
                success: false,
                message: 'MT5 account not found or access denied'
            });
        }

        // Check if sufficient balance
        if (parseFloat(account.balance) < balance) {
            return res.status(400).json({
                success: false,
                message: 'Insufficient balance for withdrawal'
            });
        }

        // Call MT5 API to deduct balance
        const mt5Response = await mt5Service.withdrawMt5Balance(login, balance, comment || 'Withdrawal via CRM');

        if (!mt5Response.Success) {
            return res.status(400).json({
                success: false,
                message: mt5Response.Message || 'Failed to withdraw from MT5 account'
            });
        }

        const mt5Data = mt5Response.Data;

        // Update account balance in database
        const updatedAccount = await prisma.MT5Account.update({
            where: { id: account.id },
            data: {
                balance: parseFloat(mt5Data.Balance),
                equity: parseFloat(mt5Data.Equity),
                marginFree: parseFloat(mt5Data.MarginFree),
                updatedAt: new Date()
            }
        });

        // Create transaction record
        await prisma.MT5Transaction.create({
            data: {
                type: 'Withdrawal',
                amount: parseFloat(balance),
                status: 'completed',
                comment: comment || 'Withdrawal via CRM',
                mt5AccountId: account.id,
                transactionId: `WDR_${Date.now()}_${login}`
            }
        });

        res.json({
            success: true,
            message: 'Withdrawal successful',
            data: {
                login: login,
                amount: balance,
                newBalance: updatedAccount.balance,
                newEquity: updatedAccount.equity
            }
        });

    } catch (error) {
        console.error('Error withdrawing from MT5 account:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Internal server error'
        });
    }
};

// 4.5 GET /api/mt5/user-profile/:login
export const getUserProfile = async (req, res) => {
    try {
        const { login } = req.params;

        // Get user ID from authenticated request
        const userId = req.user.id;

        // Validate login parameter
        if (!login) {
            return res.status(400).json({
                success: false,
                message: 'Login parameter is required'
            });
        }

        // Verify the MT5 account belongs to the authenticated user
        const account = await prisma.MT5Account.findFirst({
            where: {
                accountId: login.toString(),
                userId: userId
            }
        });

        if (!account) {
            return res.status(404).json({
                success: false,
                message: 'MT5 account not found or access denied'
            });
        }

        // Call MT5 API to get fresh profile data
        const mt5Response = await mt5Service.getMt5UserProfile(login);

        if (!mt5Response.Success) {
            return res.status(400).json({
                success: false,
                message: mt5Response.Message || 'Failed to fetch MT5 user profile'
            });
        }

        const mt5Data = mt5Response.Data;

        // Update account data in database with fresh MT5 data
        const updatedAccount = await prisma.MT5Account.update({
            where: { id: account.id },
            data: {
                balance: parseFloat(mt5Data.Balance),
                equity: parseFloat(mt5Data.Equity),
                credit: parseFloat(mt5Data.Credit || 0),
                margin: parseFloat(mt5Data.Margin || 0),
                marginFree: parseFloat(mt5Data.MarginFree || 0),
                marginLevel: parseFloat(mt5Data.MarginLevel || 0),
                profit: parseFloat(mt5Data.Profit || 0),
                isEnabled: mt5Data.IsEnabled,
                updatedAt: new Date()
            }
        });

        res.json({
            success: true,
            message: 'User profile retrieved successfully',
            data: {
                login: parseInt(login),
                name: updatedAccount.name,
                group: updatedAccount.groupName,
                email: updatedAccount.email,
                country: updatedAccount.country,
                phone: updatedAccount.phone,
                leverage: updatedAccount.leverage,
                balance: updatedAccount.balance,
                credit: updatedAccount.credit,
                equity: updatedAccount.equity,
                margin: updatedAccount.margin,
                marginFree: updatedAccount.marginFree,
                marginLevel: updatedAccount.marginLevel,
                profit: updatedAccount.profit,
                isEnabled: updatedAccount.isEnabled,
                createdAt: updatedAccount.createdAt,
                updatedAt: updatedAccount.updatedAt
            }
        });

    } catch (error) {
        console.error('Error fetching MT5 user profile:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Internal server error'
        });
    }
};