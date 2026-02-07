import { OrganizationMembership } from "../../models/schema/organizationMembership.schema";
import { Organization } from "../../models/schema/org.schema";

export class OrgService {

  async createOrg(req: any) {
    try {
      const user = req.user;
      if (!user) {
        return{
          status: 401,
          body: { message: "Unauthorized" },
        }
      }
      
      const { name, slug } = req.body;
      const existingOrg = await Organization.findOne({ slug });
      if (existingOrg) {
        return {
          status: 409,
          body: { message: "Organization already exists" },
        };
      }
      const org = await Organization.create({ name, slug });
      await OrganizationMembership.create({
        userId: user.userId,
        orgId: org._id,
        role: "owner",
      });
      return { status: 201, body: org };
    } catch (error: any) {
      return {
        status: 500,
        body: { message: error.message || "Internal server error" },
      };
    }
  }

  async getAllOrg(req: any) {
    try {
      const user = req.user;
      //this will return all the orgs that the user is a member of, along with the role of the user in each org
      const organizations = await OrganizationMembership.find({
        userId: user.userId,
      }).populate("orgId");
      return { status: 200, body: organizations };
    } catch (error: any) {
      return {
        status: 500,
        body: { message: error.message || "Internal server error" },
      };
    }
  }
}
