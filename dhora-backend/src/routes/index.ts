import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import clothingRoutes from './clothing.routes';
import stylistRoutes from './stylist.routes';
import plannerRoutes from './planner.routes';
import insightsRoutes from './insights.routes';
import beforeYouBuyRoutes from './beforeYouBuy.routes';
import tripRoutes from './trip.routes';
import shoppingRoutes from './shopping.routes';
import rentalRoutes from './rental.routes';
import communityBuyRoutes from './communityBuy.routes';
import notificationRoutes from './notification.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/wardrobe', clothingRoutes);
router.use('/stylist', stylistRoutes);
router.use('/planner', plannerRoutes);
router.use('/insights', insightsRoutes);
router.use('/before-you-buy', beforeYouBuyRoutes);
router.use('/trip', tripRoutes);
router.use('/shopping', shoppingRoutes);
router.use('/rentals', rentalRoutes);
router.use('/community-buy', communityBuyRoutes);
router.use('/notifications', notificationRoutes);

router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    app: 'DHORA API',
    tagline: 'Style-ta Dhoro, Nijer Moto Cholo',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

export default router;
