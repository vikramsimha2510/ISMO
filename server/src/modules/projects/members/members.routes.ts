import { Router } from 'express';
import { membersController } from './members.controller.js';
import { authMiddleware } from '../../../middleware/auth.middleware.js';

const router = Router({ mergeParams: true });

// All member routes require authentication
router.use(authMiddleware);

// List members of a project — any member
router.get('/:id/members', membersController.getMembers);

// Remove a member from a project — OWNER only
router.delete('/:id/members/:userId', membersController.removeMember);

export default router;
