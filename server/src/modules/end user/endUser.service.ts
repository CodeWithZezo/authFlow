import { ProjectPolicy } from "../../models/schema/projectPolicy.schema"

export class EndUserService {
    constructor(){}
    async signup(data: any){
        const {project} = data.project
        const {email, password} = data

        const projectPolicies = await ProjectPolicy.find({project_id:project._id})
        if(!projectPolicies){
            return {status:404, body:{message:"Project policies not found"}}
        }
        //firstly check all the things we have which is included in project policies
        if(projectPolicies.phoneRequired && !data.phone){
            return {status:400, body:{message:'phone is required'}}
        }

        return {status:201, body:user}
    }
}