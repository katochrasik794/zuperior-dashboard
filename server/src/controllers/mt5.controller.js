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

        // Store account in database (simplified schema)
        console.log('🔄 Storing MT5 account in database...');
        console.log('📊 MT5 Login ID:', mt5Login);
        console.log('👤 User ID:', userId);

        const newAccount = await prisma.MT5Account.create({
            data: {
                accountId: mt5Login.toString(),
                userId: userId
            }
        });

        console.log('✅ MT5 account stored successfully in database');
        console.log('🆔 Database record ID:', newAccount.id);
        console.log('💾 Stored accountId:', newAccount.accountId);

        res.json({
            success: true,
            message: 'MT5 account created successfully',
            data: {
                mt5Login: mt5Login,
                accountId: newAccount.id
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

        // Update account status in database
        console.log('🔄 Updating MT5 account in database after deposit...');
        const updatedAccount = await prisma.MT5Account.update({
            where: { id: account.id },
            data: {
                status: mt5Data.IsEnabled,
                updatedAt: new Date()
            }
        });
        console.log('✅ MT5 account updated successfully after deposit');

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
                status: updatedAccount.status
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

        console.log('🔍 Fetching user MT5 accounts from database...');
        console.log('👤 User ID:', userId);
        console.log('📊 Number of accounts found:', accounts.length);

        accounts.forEach((account, index) => {
            console.log(`📋 Account ${index + 1}:`, {
                id: account.id,
                accountId: account.accountId,
                createdAt: account.createdAt
            });
        });

        res.json({
            success: true,
            message: 'User accounts retrieved successfully',
            data: {
                accounts: accounts.map(account => ({
                    id: account.id,
                    accountId: account.accountId,
                    createdAt: account.createdAt
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

        // Update account status in database
        console.log('🔄 Updating MT5 account in database after withdrawal...');
        const updatedAccount = await prisma.MT5Account.update({
            where: { id: account.id },
            data: {
                status: mt5Data.IsEnabled,
                updatedAt: new Date()
            }
        });
        console.log('✅ MT5 account updated successfully after withdrawal');

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
                status: updatedAccount.status
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

        // Update account status in database with fresh MT5 data
        console.log('🔄 Updating MT5 account in database with fresh profile data...');
        const updatedAccount = await prisma.MT5Account.update({
            where: { id: account.id },
            data: {
                status: mt5Data.IsEnabled,
                updatedAt: new Date()
            }
        });
        console.log('✅ MT5 account updated successfully with fresh profile data');

        res.json({
            success: true,
            message: 'User profile retrieved successfully',
            data: {
                login: parseInt(login),
                accountId: account.accountId,
                platform: updatedAccount.platform,
                leverage: updatedAccount.leverage,
                status: updatedAccount.status,
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

// 4.6 POST /api/mt5/store-account
export const storeAccount = async (req, res) => {
    try {
        const { accountId, userName, userEmail } = req.body;

        console.log('🔄 SERVER: Storing MT5 account in database...');
        console.log('📊 Account ID:', accountId);
        console.log('👤 User Name:', userName);
        console.log('📧 User Email:', userEmail);

        // Validate required fields
        if (!accountId) {
            return res.status(400).json({
                success: false,
                message: 'Account ID is required'
            });
        }

        if (!userName || !userEmail) {
            return res.status(400).json({
                success: false,
                message: 'User name and email are required'
            });
        }

        // Find user by name and email
        const user = await prisma.user.findFirst({
            where: {
                name: userName,
                email: userEmail
            }
        });

        if (!user) {
            console.log('❌ User not found with name:', userName, 'and email:', userEmail);
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        console.log('✅ Found user:', user.name, 'with ID:', user.id);

        // Check if account already exists
        const existingAccount = await prisma.MT5Account.findFirst({
            where: {
                accountId: accountId.toString(),
                userId: user.id
            }
        });

        if (existingAccount) {
            console.log('⚠️ MT5 account already exists in database');
            return res.json({
                success: true,
                message: 'MT5 account already exists in database',
                data: {
                    accountId: existingAccount.accountId,
                    id: existingAccount.id
                }
            });
        }

        // Store account in database with only basic fields
        const newAccount = await prisma.MT5Account.create({
            data: {
                accountId: accountId.toString(),
                userId: user.id
            }
        });

        console.log('✅ SERVER: MT5 account stored successfully in database');
        console.log('🆔 Database record ID:', newAccount.id);
        console.log('💾 Stored accountId:', newAccount.accountId);

        res.json({
            success: true,
            message: 'MT5 account stored in database successfully',
            data: {
                accountId: newAccount.accountId,
                id: newAccount.id
            }
        });

    } catch (error) {
        console.error('❌ SERVER: Error storing MT5 account in database:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Internal server error'
        });
    }
};