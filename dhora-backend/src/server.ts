import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { ENV } from './config/env';
import { connectDB } from './config/db';
import apiRoutes from './routes';
import { errorHandler } from './middleware/error.middleware';

const app = express();

// Security and utility middleware
app.use(helmet());
app.use(
  cors({
    origin: '*', // Allow Expo mobile apps & dev tunnels
    credentials: true,
  })
);
app.use(morgan('dev'));
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Base API router
app.use('/api', apiRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    brand: 'DHORA',
    tagline: 'Style-ta Dhoro, Nijer Moto Cholo',
    service: 'DHORA Backend Core Services',
    healthCheck: '/api/health',
  });
});

// Centralized error handler
app.use(errorHandler);

// Start server
const startServer = async () => {
  await connectDB();

  app.listen(ENV.PORT, () => {
    console.log(`===============================================`);
    console.log(`👗 DHORA API Server running on port ${ENV.PORT}`);
    console.log(`🌟 Tagline: Style-ta Dhoro, Nijer Moto Cholo`);
    console.log(`🚀 Healthcheck: http://localhost:${ENV.PORT}/api/health`);
    console.log(`===============================================`);
  });
};

if (!process.env.VERCEL) {
  startServer();
} else {
  connectDB().catch((err) => console.warn('[Vercel DB Init Warning]:', err));
}

export default app;
