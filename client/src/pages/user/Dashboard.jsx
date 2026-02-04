import React, { useState } from "react";
import {
  LogOut,
  Settings,
  Building2,
  Shield,
  LayoutDashboard,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import Organization from "../../components/user/dashboard/Organization";
import Overview from "../../components/user/dashboard/Overview";

const Dashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [activeView, setActiveView] = useState("overview");

  return (
    <>
      <div className="min-h-screen flex bg-slate-950 text-white">
        <aside className="w-64 shrink-0 bg-slate-900/70 border-r border-slate-800">
          {/* Brand */}
          <div className="p-6 flex items-center space-x-2 border-b border-slate-800">
            <Shield className="w-8 h-8 text-indigo-400" />
            <span className="text-xl font-bold text-white">AuthKit</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            <button
              onClick={() => setActiveView("overview")}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition"
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveView("org")}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition"
            >
              <Building2 className="w-5 h-5" />
              <span>Organization</span>
            </button>

            <button
              onClick={() => navigate("/settings")}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition"
            >
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </button>
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-slate-800">
            <button
              onClick={logout}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </aside>
        <div className="flex-1 flex flex-col min-w-0">
        <main>
          {/* {activeView === 'dashboard' && <DashboardHome />} */}
          {/* {activeView === 'settings' && <Settings />} */}
          {activeView === "org" && <Organization />}
          {activeView === "overview" && <Overview />}
        </main>
        </div>
          
      </div>
    </>
  );
};

export default Dashboard;
