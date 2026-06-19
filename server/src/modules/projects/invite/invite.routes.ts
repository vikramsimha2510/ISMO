import { Router } from 'express';
import { inviteController } from './invite.controller.js';
import { authMiddleware } from '../../../middleware/auth.middleware.js';
import { validate } from '../../../middleware/validate.middleware.js';
import { joinProjectSchema } from './invite.schema.js';

const router = Router({ mergeParams: true });

// All invite routes require authentication
router.use(authMiddleware);

// Join a project via invite code — any authenticated user
router.post('/join', validate(joinProjectSchema), inviteController.joinProject);

// Regenerate invite code — OWNER only (checked in service)
router.post('/:id/invite/regenerate', inviteController.regenerateInvite);

// Toggle invite enabled/disabled — OWNER only (checked in service)
router.patch('/:id/invite/toggle', inviteController.toggleInvite);

export default router;
