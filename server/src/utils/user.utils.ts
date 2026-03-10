import { Organization } from "../models/schema/org.schema";
import { OrganizationMembership } from "../models/schema/organizationMembership.schema";
import { ProjectMembership } from "../models/schema/projectMembership.schema";

//there i can find the organization membership for a user in a specific organization, and then i can find the organization details for that organization. this is useful for checking if a user is a member of an organization and what their role is in that organization.
export const findOrganizationByUserId = async (userId: string, orgId: string) => {
    const org = await OrganizationMembership.findOne({ userId: userId, orgId: orgId }).lean();
    return org;
}
//there i can find all of the organizations that the user is a member of, and then i can find the organization details for each of those organizations.
export const findOrganizationsByUserId = async (userId: string) => {
    const orgMemberships = await OrganizationMembership.find({ userId: userId }).lean();
    const orgIds = orgMemberships.map(membership => membership.orgId);
    const organizations = await Organization.find({ _id: { $in: orgIds } }).lean();
    return organizations;
}
//there i can find the role for a specific user in a specific organization, and then i can check if that role has the necessary permissions for a specific action.
export const findOrganizationMembershipByUserId = async (userId: string, orgId: string) => {
    const orgMembership = await OrganizationMembership.findOne({ userId: userId, orgId: orgId }).lean();
    return orgMembership;
}
//here i can check the role of the user in the organization and then i can check if that role has the necessary permissions for a specific action. this is useful for checking if a user has the necessary permissions to perform a specific action in an organization.
export const findProjectMembershipByUserId = async (userId: string, projectId: string) => {
    const projectMembership = await ProjectMembership.findOne({ userId: userId, projectId: projectId }).lean();
    return projectMembership;
}
//here i can find all of the projects that the user is a member of, and then i can find the project details for each of those projects. this is useful for checking if a user is a member of a project and what their role is in that project.
export const findProjectsByUserId = async (userId: string) => {
    const projectMemberships = await ProjectMembership.find({ userId: userId }).lean();
    const projectIds = projectMemberships.map(membership => membership.projectId);
    const projects = await Organization.find({ _id: { $in: projectIds } }).lean();
    return projects;
}
//here i can check the role of the user in the project and then i can check if that role has the necessary permissions for a specific action. this is useful for checking if a user has the necessary permissions to perform a specific action in a project.
export const findProjectMembershipByUserIdAndProjectId = async (userId: string, projectId: string) => {
    const projectMembership = await ProjectMembership.findOne({ userId: userId, projectId: projectId }).lean();
    return projectMembership;
}

//that's the function that i will use in the rbac middleware to check if the user has the necessary permissions to perform a specific action in an organization. this is useful for checking if a user has the necessary permissions to perform a specific action in an organization.
export const findOrganizationMembershipByUserIdAndOrgId = async (userId: string, orgId: string) => {
    const orgMembership = await OrganizationMembership.findOne({ userId: userId, orgId: orgId }).lean();
    return orgMembership;   
}