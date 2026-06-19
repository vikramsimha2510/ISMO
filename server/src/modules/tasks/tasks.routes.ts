import { Router } from 'express';
import { tasksController } from './tasks.controller.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { validate, validateQuery } from '../../middleware/validate.middleware.js';
import { createTaskSchema, updateTaskSchema, taskQuerySchema } from './tasks.schema.js';

const router = Router();

// All task routes require authentication
router.use(authMiddleware);

router.get('/', validateQuery(taskQuerySchema), tasksController.getAll);
router.get('/:id', tasksController.getById);
router.post('/', validate(createTaskSchema), tasksController.create);
router.put('/:id', validate(updateTaskSchema), tasksController.update);
router.delete('/:id', tasksController.remove);

export default router;
