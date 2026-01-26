import { Router } from 'express';
import userRouter from './user/user.route';
import endUserRouter from './end user/endUser.route';
import orgRouter from './org/org.route';
import  {resolveProjectContext}  from '../middleware/endUser.middleware'

const router = Router();

router.use('/users', userRouter);
router.use('/orgs', orgRouter);
router.use('/v1/project/:projectId/end-user',resolveProjectContext ,endUserRouter)

export default router;