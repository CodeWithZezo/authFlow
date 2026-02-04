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
          <Route path="/:xwujndci" element={<Organization />} />
        </Route>
      </Routes>
    </>
  );
};

export default App;
