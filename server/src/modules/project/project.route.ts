import express from 'express';
const router = express.Router();
import ProjectController from './project.controller';
import { authenticate } from '../../middleware/auth.middleware';

const projectController = new ProjectController();

router.post("/create-project",authenticate, projectController.createProject);


export default router;