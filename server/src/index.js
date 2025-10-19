// zuperior-dashboard/server/src/index.js

import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth.routes.js'; // Ensure this path is correct

// --- Configuration ---
const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

// --- Middleware ---
app.use(cors({
    // Allow the client (Next.js) to access the API
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Health Check Route ---
app.get('/', (req, res) => {
    res.status(200).send('Zuperior API is running!');
});

// --- Routes ---
app.use('/api', authRoutes); // Authentication routes (Login/Register)

// --- Start Server ---
async function main() {
    try {
        await prisma.$connect();
        console.log('Database connected successfully.');

        app.listen(PORT, async () => {
            console.log(`Server is running on port ${PORT}`);
            console.log(`API URL: http://localhost:${PORT}/`);

            // Register MT5 routes after server starts
            try {
                const mt5Routes = await import('./routes/mt5.routes.js');
                app.use('/api', mt5Routes.default);
                console.log('MT5 routes registered at /api/mt5/*');
            } catch (error) {
                console.error('Failed to load MT5 routes:', error.message);
            }
        });
    } catch (error) {
        console.error('Failed to start server or connect to database:', error);
        process.exit(1);
    }
}

main();