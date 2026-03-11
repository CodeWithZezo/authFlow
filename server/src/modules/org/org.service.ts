import { Organization } from "../../models/schema/org.schema";
import { OrganizationMembership } from "../../models/schema/organizationMembership.schema";
import { IOrganization, IOrganizationMembership } from "../../models/models.types";
import { IServiceResponse } from "../../types/auth.types";
import { Role, Status } from "../../models/enums";
import { logger } from "../../utils/logger";

interface ICreateOrgRequest {
  name: string;
  slug: string;
}

interface IUpdateOrgRequest {
  name?: string;
  slug?: string;
}

interface IAddMemberRequest {
  userId: string;
  role?: Role;
}

interface IUpdateMemberRequest {
  role?: Role;
  status?: Status;
}

export class OrgService {

  // ─── Create Organization ────────────────────────────────────────────────────
  async createOrg(
    data: ICreateOrgRequest,
    userId: string
  ): Promise<IServiceResponse<any>> {
    try {
      const { name, slug } = data;

      if (!name || !slug) {
        return {
          status: 400,
          body: { message: "Name and slug are required" },
        };
      }

      const org = await Organization.create({ name, slug });

      // Auto-assign creator as owner
      await OrganizationMembership.create({
        userId,
        orgId: org._id,
        role: Role.OWNER,
        status: Status.ACTIVE,
      });

      return {
        status: 201,
        body: {
          message: "Organization created successfully",
          org,
        },
      };
    } catch (error: any) {
      if (error.code === 11000) {
        return { status: 409, body: { message: "Organization slug already exists" } };
      }
      logger.error("OrgService.createOrg", error);
      return { status: 500, body: { message: "Internal server error" } };
    }
  }

  // ─── Get Organization ───────────────────────────────────────────────────────
  async getOrg(
    orgId: string,
    userId: string
  ): Promise<IServiceResponse<any>> {
    try {
      // Verify user is a member of the org
      const membership = await OrganizationMembership.findOne({ orgId, userId }).lean();
      if (!membership) {
        return { status: 403, body: { message: "You are not a member of this organization" } };
      }

      const org = await Organization.findById(orgId).lean();
      if (!org) {
        return { status: 404, body: { message: "Organization not found" } };
      }

      return {
        status: 200,
        body: {
          message: "Organization fetched successfully",
          org,
        },
      };
    } catch (error) {
      logger.error("OrgService.getOrg", error);
      return { status: 500, body: { message: "Internal server error" } };
    }
  }

  // ─── Update Organization ────────────────────────────────────────────────────
  async updateOrg(
    orgId: string,
    data: IUpdateOrgRequest
  ): Promise<IServiceResponse<any>> {
    try {
      const org = await Organization.findByIdAndUpdate(
        orgId,
        { $set: data },
        { new: true, runValidators: true }
      ).lean();

      if (!org) {
        return { status: 404, body: { message: "Organization not found" } };
      }

      return {
        status: 200,
        body: {
          message: "Organization updated successfully",
          org,
        },
      };
    } catch (error: any) {
      if (error.code === 11000) {
        return { status: 409, body: { message: "Organization slug already exists" } };
      }
      logger.error("OrgService.updateOrg", error);
      return { status: 500, body: { message: "Internal server error" } };
    }
  }

  // ─── Delete Organization ────────────────────────────────────────────────────
  async deleteOrg(orgId: string): Promise<IServiceResponse<any>> {
    try {
      const org = await Organization.findByIdAndDelete(orgId).lean();

      if (!org) {
        return { status: 404, body: { message: "Organization not found" } };
      }

      // Cascade delete all memberships
      await OrganizationMembership.deleteMany({ orgId });

      return {
        status: 200,
        body: { message: "Organization deleted successfully" },
      };
    } catch (error) {
      logger.error("OrgService.deleteOrg", error);
      return { status: 500, body: { message: "Internal server error" } };
    }
  }

  // ─── Get All Members ────────────────────────────────────────────────────────
  async getOrgMembers(orgId: string): Promise<IServiceResponse<any>> {
    try {
      const members = await OrganizationMembership.find({ orgId })
        .populate("userId", "fullName email phone isVerified")
        .lean();

      return {
        status: 200,
        body: {
          message: "Members fetched successfully",
          members,
        },
      };
    } catch (error) {
      logger.error("OrgService.getOrgMembers", error);
      return { status: 500, body: { message: "Internal server error" } };
    }
  }

  // ─── Add Member ─────────────────────────────────────────────────────────────
  async addOrgMember(
    orgId: string,
    data: IAddMemberRequest
  ): Promise<IServiceResponse<any>> {
    try {
      const { userId, role = Role.MEMBER } = data;

      if (!userId) {
        return { status: 400, body: { message: "userId is required" } };
      }

      const org = await Organization.findById(orgId).lean();
      if (!org) {
        return { status: 404, body: { message: "Organization not found" } };
      }

      const membership = await OrganizationMembership.create({
        userId,
        orgId,
        role,
        status: Status.ACTIVE,
      });

      return {
        status: 201,
        body: {
          message: "Member added successfully",
          membership,
        },
      };
    } catch (error: any) {
      if (error.code === 11000) {
        return { status: 409, body: { message: "User is already a member of this organization" } };
      }
      logger.error("OrgService.addOrgMember", error);
      return { status: 500, body: { message: "Internal server error" } };
    }
  }

  // ─── Get Single Member ──────────────────────────────────────────────────────
  async getOrgMember(
    orgId: string,
    userId: string
  ): Promise<IServiceResponse<any>> {
    try {
      const membership = await OrganizationMembership.findOne({ orgId, userId })
        .populate("userId", "fullName email phone isVerified")
        .lean();

      if (!membership) {
        return { status: 404, body: { message: "Member not found in this organization" } };
      }

      return {
        status: 200,
        body: {
          message: "Member fetched successfully",
          membership,
        },
      };
    } catch (error) {
      logger.error("OrgService.getOrgMember", error);
      return { status: 500, body: { message: "Internal server error" } };
    }
  }

  // ─── Update Member Role / Status ────────────────────────────────────────────
  async updateOrgMember(
    orgId: string,
    userId: string,
    data: IUpdateMemberRequest
  ): Promise<IServiceResponse<any>> {
    try {
      const { role, status } = data;

      // Prevent downgrading the last owner
      if (role && role !== Role.OWNER) {
        const ownerCount = await OrganizationMembership.countDocuments({
          orgId,
          role: Role.OWNER,
          userId,
        });
        if (ownerCount === 1) {
          const isTargetOwner = await OrganizationMembership.findOne({ orgId, userId, role: Role.OWNER });
          if (isTargetOwner) {
            return {
              status: 400,
              body: { message: "Cannot change role of the last owner" },
            };
          }
        }
      }

      const membership = await OrganizationMembership.findOneAndUpdate(
        { orgId, userId },
        { $set: { ...(role && { role }), ...(status && { status }) } },
        { new: true, runValidators: true }
      ).lean();

      if (!membership) {
        return { status: 404, body: { message: "Member not found in this organization" } };
      }

      return {
        status: 200,
        body: {
          message: "Member updated successfully",
          membership,
        },
      };
    } catch (error) {
      logger.error("OrgService.updateOrgMember", error);
      return { status: 500, body: { message: "Internal server error" } };
    }
  }

  // ─── Remove Member ──────────────────────────────────────────────────────────
  async removeOrgMember(
    orgId: string,
    userId: string
  ): Promise<IServiceResponse<any>> {
    try {
      // Prevent removing the last owner
      const membership = await OrganizationMembership.findOne({ orgId, userId }).lean();
      if (!membership) {
        return { status: 404, body: { message: "Member not found in this organization" } };
      }

      if (membership.role === Role.OWNER) {
        const ownerCount = await OrganizationMembership.countDocuments({ orgId, role: Role.OWNER });
        if (ownerCount === 1) {
          return {
            status: 400,
            body: { message: "Cannot remove the last owner of an organization" },
          };
        }
      }

      await OrganizationMembership.deleteOne({ orgId, userId });

      return {
        status: 200,
        body: { message: "Member removed successfully" },
      };
    } catch (error) {
      logger.error("OrgService.removeOrgMember", error);
      return { status: 500, body: { message: "Internal server error" } };
    }
  }
}
