import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import path from 'path';

// Import routes
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

app.use('/images', express.static(path.join(process.cwd(), 'public/images')));

// Middleware
app.use(cors({
  origin: [process.env.FRONTEND_URL,  
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175',
        'https://jsd-project-group-2.vercel.app/'],
        credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: '🐾 Pet Shop API is running!',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;


app.listen(PORT, () => {
  console.log(`
  🐾 =======================================
  🐾 Pet Shop API Server
  🐾 =======================================
  🐾 Mode: ${process.env.NODE_ENV}
  🐾 Port: ${PORT}
  🐾 URL: http://localhost:${PORT}
  🐾 =======================================
  `);
});
