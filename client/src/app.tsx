// ==================== src/app.tsx — FINAL ====================
import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { Toaster } from "sonner";

import { AuthLayout }     from "@/layouts/AuthLayout";
import { ProtectedRoute } from "@/components/shared/ProtectedRoute";
import { LoginPage }  from "@/routes/_auth/login";
import { SignupPage } from "@/routes/_auth/signup";
import  Home  from "./pages/Home";

// Docs — lazy loaded
const DocsPage = lazy(() =>
  import("./pages/docs/DocsPage").then((m) => ({ default: m.DocsPage }))
);

// Layouts
const AppLayout       = lazy(() => import("@/layouts/AppLayout").then(m      => ({ default: m.AppLayout })));
const OrgLayout       = lazy(() => import("@/layouts/OrgLayout").then(m      => ({ default: m.OrgLayout })));
const ProjectLayout   = lazy(() => import("@/layouts/ProjectLayout").then(m  => ({ default: m.ProjectLayout })));
const AccountLayout   = lazy(() => import("@/layouts/AccountLayout").then(m  => ({ default: m.AccountLayout })));

// Dashboard
const DashboardPage       = lazy(() => import("@/routes/_app/dashboard").then(m => ({ default: m.DashboardPage })));

// Org pages
const CreateOrgPage       = lazy(() => import("@/routes/_app/orgs/new").then(m          => ({ default: m.CreateOrgPage })));
const OrgOverviewPage     = lazy(() => import("@/routes/_app/orgs/overview").then(m     => ({ default: m.OrgOverviewPage })));
const OrgMembersPage      = lazy(() => import("@/routes/_app/orgs/members").then(m      => ({ default: m.OrgMembersPage })));
const OrgSettingsPage     = lazy(() => import("@/routes/_app/orgs/settings").then(m     => ({ default: m.OrgSettingsPage })));

// Project pages
const ProjectsListPage    = lazy(() => import("@/routes/_app/orgs/projects/index").then(m           => ({ default: m.ProjectsListPage })));
const CreateProjectPage   = lazy(() => import("@/routes/_app/orgs/projects/new").then(m             => ({ default: m.CreateProjectPage })));
const ProjectOverviewPage = lazy(() => import("@/routes/_app/orgs/projects/overview").then(m        => ({ default: m.ProjectOverviewPage })));
const ProjectMembersPage  = lazy(() => import("@/routes/_app/orgs/projects/members").then(m         => ({ default: m.ProjectMembersPage })));
const ProjectSettingsPage = lazy(() => import("@/routes/_app/orgs/projects/settings").then(m        => ({ default: m.ProjectSettingsPage })));
const ProjectPolicyPage   = lazy(() => import("@/routes/_app/orgs/projects/policy").then(m          => ({ default: m.ProjectPolicyPage })));
const PasswordPolicyPage  = lazy(() => import("@/routes/_app/orgs/projects/password-policy").then(m => ({ default: m.PasswordPolicyPage })));

// Account pages
const ProfilePage   = lazy(() => import("@/routes/_app/account/profile").then(m   => ({ default: m.ProfilePage })));
const SessionsPage  = lazy(() => import("@/routes/_app/account/sessions").then(m  => ({ default: m.SessionsPage })));
const SecurityPage  = lazy(() => import("@/routes/_app/account/security").then(m  => ({ default: m.SecurityPage })));

function PageLoader() {
  return (
    <div className="flex h-screen items-center justify-center bg-[var(--color-bg)]">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-accent)]" />
        <p className="text-xs text-[var(--color-text-muted)] tracking-widest uppercase">Loading</p>
      </div>
    </div>
  );
}

function S({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/docs" element={<Navigate to="/docs/getting-started" replace />} />
        <Route path="/docs/:section" element={<S><DocsPage /></S>} />

        {/* ── Auth (public) ── */}
        <Route element={<AuthLayout />}>

          <Route path="login"  element={<LoginPage />} />
          <Route path="signup" element={<SignupPage />} />
        </Route>

        {/* ── Protected ── */}
        <Route element={<ProtectedRoute />}>
          <Route element={<S><AppLayout /></S>}>

            <Route path="dashboard" element={<S><DashboardPage /></S>} />

            {/* ── Orgs ── */}
            <Route path="orgs/new" element={<S><CreateOrgPage /></S>} />
            <Route path="orgs/:orgId" element={<S><OrgLayout /></S>}>
              <Route index element={<Navigate to="overview" replace />} />
              <Route path="overview"  element={<S><OrgOverviewPage /></S>} />
              <Route path="members"   element={<S><OrgMembersPage /></S>} />
              <Route path="settings"  element={<S><OrgSettingsPage /></S>} />
              <Route path="projects"     element={<S><ProjectsListPage /></S>} />
              <Route path="projects/new" element={<S><CreateProjectPage /></S>} />

              {/* ── Projects ── */}
              <Route path="projects/:projectId" element={<S><ProjectLayout /></S>}>
                <Route index element={<Navigate to="overview" replace />} />
                <Route path="overview"        element={<S><ProjectOverviewPage /></S>} />
                <Route path="members"         element={<S><ProjectMembersPage /></S>} />
                <Route path="policy"          element={<S><ProjectPolicyPage /></S>} />
                <Route path="password-policy" element={<S><PasswordPolicyPage /></S>} />
                <Route path="settings"        element={<S><ProjectSettingsPage /></S>} />
              </Route>
            </Route>

            {/* ── Account ── */}
            <Route path="account" element={<S><AccountLayout /></S>}>
              <Route index element={<Navigate to="profile" replace />} />
              <Route path="profile"  element={<S><ProfilePage /></S>}  />
              <Route path="sessions" element={<S><SessionsPage /></S>} />
              <Route path="security" element={<S><SecurityPage /></S>} />
            </Route>

          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>

      <Toaster
        position="bottom-right"
        theme="dark"
        toastOptions={{
          style: {
            background: "var(--color-surface-2)",
            border:     "1px solid var(--color-border)",
            color:      "var(--color-text-primary)",
            fontFamily: "var(--font-sans)",
            fontSize:   "13px",
          },
        }}
      />
    </BrowserRouter>
  );
}
