import { Project } from "../../models/schema/project.schema"

export class ServiceService {
    getApiKeyService = async (projectId: string) => {
        try {
            const project = await Project.findById({ projectId })
            if (project?.status === 'inactive' || project?.status === 'suspended') {
                throw new Error('project is not active')
            }

            const api = 'http://localhost:3000/api/v1/project/' + projectId + '/end-user'
            return { status: 200, data: { api } }
        } catch (error: any) {
            return { status: 500, error: error.message }
        }
    }
}