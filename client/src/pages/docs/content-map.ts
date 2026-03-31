export interface DocSection {
  slug: string;
  label: string;
  description: string;
  icon: string;
  group: "start" | "core" | "management" | "advanced";
}

export const DOC_SECTIONS: DocSection[] = [
  {
    slug: "getting-started",
    label: "Getting Started",
    description: "Setup, prerequisites, and first steps",
    icon: "Rocket",
    group: "start",
  },
  {
    slug: "authentication",
    label: "Authentication",
    description: "Signup, login, logout, token refresh",
    icon: "KeyRound",
    group: "core",
  },
  {
    slug: "organizations",
    label: "Organizations",
    description: "Create and manage organizations",
    icon: "Building2",
    group: "core",
  },
  {
    slug: "projects",
    label: "Projects",
    description: "Projects, roles, and settings",
    icon: "FolderKanban",
    group: "core",
  },
  {
    slug: "end-users",
    label: "End Users",
    description: "Signup, login, profile, avatar",
    icon: "Users",
    group: "core",
  },
  {
    slug: "policies",
    label: "Policies",
    description: "Password policy, project policy",
    icon: "Shield",
    group: "management",
  },
  {
    slug: "sessions",
    label: "Sessions",
    description: "List, view, and revoke sessions",
    icon: "Activity",
    group: "management",
  },
  {
    slug: "avatar",
    label: "Avatar",
    description: "Upload, stream, and delete avatars",
    icon: "ImageIcon",
    group: "advanced",
  },
];

export const GROUP_LABELS: Record<DocSection["group"], string> = {
  start: "Overview",
  core: "Core API",
  management: "Management",
  advanced: "Advanced",
};

export const DEFAULT_SECTION = "getting-started";

// Dynamic import utility — loads MD file for the given slug
export async function loadDocContent(slug: string): Promise<string> {
  try {
    const mod = await import(`./content/${slug}.md?raw`);
    return mod.default as string;
  } catch {
    return `# ${slug}\n\n> Content coming soon.`;
  }
}
