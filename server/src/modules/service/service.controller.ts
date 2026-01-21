import { ServiceService } from './service.service'
import {Request, Response} from 'express';
const serviceService = new ServiceService();

export class ServiceController {
    getApiKeyController = async(req:Request, res:Response)=>{
        const {projectId} = req.body;
        const apiKey = await serviceService.getApiKeyService(projectId);
        return res.status(200).json({apiKey});
    }
}