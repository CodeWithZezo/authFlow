import { Router } from 'express';
import userRouter from './user/user.route';
import endUserRouter from './end user/endUser.route';
import orgRouter from './org/org.route';
import projectRouter from './project/project.route'
const router = Router();

router.use('/users', userRouter);
router.use('/orgs', orgRouter);
router.use('/project',projectRouter)
router.use('/v1/project/:projectId/end-user' ,endUserRouter)
export default router;