import express from 'express';
const router = express.Router();
import ProjectController from './project.controller';
import { authenticate } from '../../middleware/auth.middleware';

const projectController = new ProjectController();

router.post("/create-project",authenticate, projectController.createProject);
// router.get("/get-project/:projectId",authenticate, projectController.getProject);
// router.get("/get-all-projects",authenticate, projectController.getAllProjects);
// router.put("/update-project/:projectId",authenticate, projectController.updateProject);
// router.delete("/delete-project/:projectId",authenticate, projectController.deleteProject);


export default router;