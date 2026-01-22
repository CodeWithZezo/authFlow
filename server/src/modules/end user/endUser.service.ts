import { ProjectPolicy } from "../../models/schema/projectPolicy.schema"

export class EndUserService {
    constructor(){}
    async signup(data: any){
        const {project} = data.project

        const projectPolicies = await ProjectPolicy.find({projectId:project._id})
        if (!projectPolicies || projectPolicies.length === 0) {
            return {status:404, body:{message:"Project policies not found"}}
        }
        

        return {status:201, body:user}
    }
}