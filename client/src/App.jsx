import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/public/Home";
import { Login } from "./pages/auth/Login";
import { Signup } from "./pages/auth/Signup";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Dashboard from "./pages/user/Dashboard";
import Organization from "./pages/org/Organization";
import { ProtectedRoute } from "./components/ProtectedRoute";
import UserSettings from "./pages/user/Setting";
const App = () => {
  return (
    <>
      <ToastContainer />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/settings" element={<UserSettings />} />
          <Route path="/org/:orgslug" element={<Organization />} />
        </Route>
      </Routes>
    </>
  );
};

export default App;
