import { Router } from 'express';
import userRouter from './user/user.route';
import endUserRouter from './end user/endUser.route';
import endUserMiddleware from '../middleware/endUser.middleware'

const router = Router();

router.use('/users', userRouter);
// router.use('/orgs', );
router.use('/v1/project/:projectId/end-user',endUserMiddleware ,endUserRouter)

export default router;