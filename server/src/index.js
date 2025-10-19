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

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
            console.log(`API URL: http://localhost:${PORT}/`);
        });
    } catch (error) {
        console.error('Failed to start server or connect to database:', error);
        process.exit(1);
    }
}

main();