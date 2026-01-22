import { Request, Response } from "express";
import { EndUserService } from "./endUser.service";

export class EndUserController {
    private userService: EndUserService
    constructor(){
        this.userService = new EndUserService()
    }
    async signup(req: Request, res: Response) {
        const {status, body } = await this.userService.signup(req.body)
        return res.status(status).json(body)
    }
}
