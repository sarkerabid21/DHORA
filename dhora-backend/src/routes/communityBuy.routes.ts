import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  getCommunityBuyFeed,
  getCommunityBuyPostById,
  createCommunityBuyPost,
  joinCommunityBuyOrder,
  getMyCommunityBuyOrders,
  updateCommunityBuyStatus,
  verifyPickupCode,
} from '../controllers/communityBuy.controller';
import {
  getPostComments,
  addPostComment,
  likeComment,
  deleteComment,
} from '../controllers/communityComment.controller';

const router = Router();

// Protect all routes with JWT auth
router.use(authenticate);

// Feed & Post Operations
router.get('/', getCommunityBuyFeed);
router.post('/', createCommunityBuyPost);
router.get('/my-orders', getMyCommunityBuyOrders);
router.post('/verify-code', verifyPickupCode);
router.get('/:id', getCommunityBuyPostById);
router.post('/:id/join', joinCommunityBuyOrder);
router.put('/:id/status', updateCommunityBuyStatus);

// Comments & Discussion
router.get('/:postId/comments', getPostComments);
router.post('/:postId/comments', addPostComment);
router.post('/comments/:commentId/like', likeComment);
router.delete('/comments/:commentId', deleteComment);

export default router;
