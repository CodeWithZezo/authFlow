// --------------------
// Roles for Users / Memberships
// --------------------
export enum Role {
    OWNER = "owner",
    ADMIN = "admin",
    MEMBER = "member",
    MANAGER = "manager",         // for project_memberships
    CONTRIBUTOR = "contributor", // for project_memberships
    VIEWER = "viewer"            // for project_memberships / end_users
}

// --------------------
// Status for Users / Memberships / Projects
// --------------------
export enum Status {
    ACTIVE = "active",
    INACTIVE = "inactive",
    PENDING = "pending",
    SUSPENDED = "suspended"
}

// --------------------
// Authentication Type for Project Policy
// --------------------
export enum AuthType {
    PASSWORD = "password",
    OAUTH = "oauth",
    TWO_FACTOR = "2fa"
}

// --------------------
// Authentication Methods
// --------------------
export enum AuthMethod {
    EMAIL = "email",
    PHONE = "phone",
    GOOGLE = "google",
    GITHUB = "github"
}
