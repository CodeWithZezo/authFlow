// ==================== Multi-Tenant Auth System ====================

// Users
Table users {
  id ObjectId [pk]
  full_name varchar [not null]
  email varchar [unique, not null]
  password_hash varchar [not null]
  phone varchar
  is_verified boolean [default: false]
  public_metadata json
  private_metadata json
  created_at datetime
  updated_at datetime
}

// Organizations
Table organizations {
  id ObjectId [pk]
  name varchar [not null]
  slug varchar [unique, not null]
  created_at datetime
  updated_at datetime
}

// Organization Memberships
Table organization_memberships {
  id ObjectId [pk]
  user_id ObjectId [ref: > users.id, not null]
  org_id ObjectId [ref: > organizations.id, not null]
  role enum('owner','admin','member') [default: 'member']
  status enum('active','inactive','pending','suspended') [default: 'pending']
  created_at datetime
  updated_at datetime
}

// Sessions
Table sessions {
  id ObjectId [pk]
  user_id ObjectId [ref: > users.id, not null]
  refresh_token varchar
  created_at datetime
  updated_at datetime
}

// Projects
Table projects {
  id ObjectId [pk]
  organization_id ObjectId [ref: > organizations.id, not null]
  name varchar
  description text
  status enum('active','inactive','pending','suspended') [default: 'active']
  created_at datetime
  updated_at datetime
}

// Project Memberships
Table project_memberships {
  id ObjectId [pk]
  project_id ObjectId [ref: > projects.id, not null]
  user_id ObjectId [ref: > users.id, not null]
  role enum('manager','contributor','viewer') [default: 'viewer']
  status enum('active','inactive','pending','suspended') [default: 'pending']
  created_at datetime
  updated_at datetime
}

// End Users (Project-specific roles)
Table end_users {
  id ObjectId [pk]
  project_id ObjectId [ref: > projects.id, not null]
  user_id ObjectId [ref: > users.id, not null]
  role enum('manager','contributor','viewer') [default: 'viewer']
  status enum('active','inactive','pending','suspended') [default: 'active']
  created_at datetime
  updated_at datetime
}

// Password Policy
Table password_policy {
  id ObjectId [pk]
  project_id ObjectId [ref: > projects.id, not null]
  min_length int [default: 8]
  require_numbers boolean [default: true]
  require_uppercase boolean [default: true]
  require_special_chars boolean [default: false]
  created_at datetime
  updated_at datetime
}

// Project Policy
Table project_policy {
  id ObjectId [pk]
  project_id ObjectId [ref: > projects.id, not null]
  phone_required boolean [default: false]
  auth_required boolean [default: true]
  auth_type enum('password','oauth','2fa') [default: 'password']
  roles string[] [note: "Allowed roles for end users"]
  statuses string[] [note: "Allowed statuses for end users"]
  auth_methods string[] [note: "Allowed auth methods per project"]
  password_policy_id ObjectId [ref: > password_policy.id, note: "Required if auth_type = password"]
  created_at datetime
  updated_at datetime
}
