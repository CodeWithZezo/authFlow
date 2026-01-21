import { AuthRequest } from "../../middleware/auth.middleware";
import { OrganizationMembership } from "../../models/schema/organizationMembership.schema";
import { Organization } from "../../models/schema/org.schema";

export class OrgService {
    async createOrg(authReq: any, req: any) {
        try {
            const user = authReq.user;
        if (!user?.isVerified) {
            throw new Error("User is not verified");
        }
        const { name, slug } = req.body;
        const exsistingOrg = Organization.findOne({ slug })
        if (!exsistingOrg) {
            throw new Error("org already exists");
        }
        const org = await Organization.create({ name, slug })
        await OrganizationMembership.create({ userId: user._id, orgId: org._id, role: "owner" })
        return { status: 201, body: org }
        } catch (error) {
            return { status: 500, body: error }
        }
    }

}