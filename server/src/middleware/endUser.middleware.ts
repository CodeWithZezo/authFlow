import { NextFunction, Request, Response } from "express";
import { Project } from "../models/schema/project.schema";
import { Status } from "../models/enums";

const endUserMiddleware = async (req:Request, res:Response, next:NextFunction ) => {
    const projectId = req.params.projectId;
    if(!projectId){
        return res.status(400).json({message:"Project id is required"})
    }
    const project = await Project.findById(projectId)
    if(!project){
        return res.status(404).json({message:"Project not found"})
    }
    if(project.status !== Status.ACTIVE){
        return res.status(400).json({message:"Project is not active"})
    }
    req.body.project = project
    next()
}