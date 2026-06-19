import { Router } from 'express';
import { projectsController } from './projects.controller.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { validateQuery } from '../../middleware/validate.middleware.js';
import { createProjectSchema, updateProjectSchema, projectQuerySchema } from './projects.schema.js';

const router = Router();

// All project routes require authentication
router.use(authMiddleware);

router.get('/', validateQuery(projectQuerySchema), projectsController.getAll);
router.get('/:id', projectsController.getById);
router.post('/', validate(createProjectSchema), projectsController.create);
router.put('/:id', validate(updateProjectSchema), projectsController.update);
router.delete('/:id', projectsController.remove);

export default router;
