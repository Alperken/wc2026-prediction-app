import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { LangProvider } from "./context/LangContext";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Fixtures from "./pages/Fixtures";
import Leaderboard from "./pages/Leaderboard";
import Predictions from "./pages/Predictions";
import Admin from "./pages/Admin";

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, profile, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-fifa-navy">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-fifa-gold border-t-transparent mx-auto mb-4" />
          <p className="text-white/50 text-sm">Loading...</p>
        </div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && profile?.role !== "admin") return <Navigate to="/fixtures" replace />;
  return <Layout>{children}</Layout>;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/fixtures" replace /> : <Login />} />
      <Route path="/fixtures" element={<ProtectedRoute><Fixtures /></ProtectedRoute>} />
      <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
      <Route path="/predictions" element={<ProtectedRoute><Predictions /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute adminOnly><Admin /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/fixtures" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <LangProvider>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </LangProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
