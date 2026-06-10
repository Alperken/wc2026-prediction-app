import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useLang } from "../context/LangContext";
import { Calendar, Trophy, Users, LogOut, Sun, Moon, Menu, X, Shield, HelpCircle } from "lucide-react";
import { AvatarBubble } from "../data/avatars";
import AvatarPicker from "./AvatarPicker";
import Onboarding from "./Onboarding";

export default function Layout({ children }) {
  const { profile, logout, updateAvatar } = useAuth();
  const { dark, toggle } = useTheme();
  const { lang, toggleLang, t } = useLang();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  const onboardingKey = `wc2026-onboarded-${profile?.id || ""}`;
  const [showOnboarding, setShowOnboarding] = useState(() => {
    if (!profile?.id) return false;
    return !localStorage.getItem(onboardingKey);
  });
  const handleOnboardingDone = () => {
    localStorage.setItem(onboardingKey, "1");
    setShowOnboarding(false);
  };

  const handleLogout = async () => { await logout(); navigate("/login"); };
  const isAdmin = profile?.role === "admin";

  const navItems = [
    { to: "/fixtures",    label: t("nav_fixtures"),    icon: Calendar },
    { to: "/leaderboard", label: t("nav_leaderboard"), icon: Trophy },
    { to: "/predictions", label: t("nav_predictions"), icon: Users },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white font-body">
      <header className="sticky top-0 z-50 bg-white dark:bg-fifa-navy border-b border-gray-200 dark:border-white/10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <NavLink to="/fixtures" className="flex items-center gap-2">
            <span className="text-2xl">🏆</span>
            <div className="hidden sm:block">
              <span className="font-display text-2xl text-fifa-blue dark:text-fifa-gold tracking-widest">WC2026</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 block -mt-1 tracking-wider">
                {lang === "tr" ? "TAHMİN LİGİ" : "PREDICTION LEAGUE"}
              </span>
            </div>
          </NavLink>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? "bg-fifa-blue dark:bg-fifa-gold text-white dark:text-fifa-navy"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10"
                  }`}
              >
                <Icon size={16} />{label}
              </NavLink>
            ))}
            {isAdmin && (
              <NavLink to="/admin"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive ? "bg-purple-600 text-white" : "text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                  }`}
              >
                <Shield size={16} />{t("nav_admin")}
              </NavLink>
            )}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-1.5">
            {/* Avatar chip */}
            <button
              onClick={() => setShowAvatarPicker(true)}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-white/10 rounded-full hover:ring-2 hover:ring-fifa-gold/50 transition"
              title={t("nav_change_avatar")}
            >
              <AvatarBubble avatarId={profile?.avatarId} size="sm" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{profile?.displayName || "User"}</span>
              {isAdmin && (
                <span className="text-xs bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 px-1.5 py-0.5 rounded-full font-semibold">
                  {lang === "tr" ? "YÖN" : "ADMIN"}
                </span>
              )}
            </button>

            {/* Language toggle */}
            <button
              onClick={toggleLang}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 transition text-sm font-bold text-gray-700 dark:text-gray-300"
              title="Switch language"
            >
              {lang === "en" ? "🇹🇷 TR" : "🇬🇧 EN"}
            </button>

            {/* Theme */}
            <button onClick={toggle} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition text-gray-600 dark:text-gray-400">
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Help */}
            <button
              onClick={() => setShowOnboarding(true)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition text-gray-400 dark:text-gray-500 hover:text-fifa-gold dark:hover:text-fifa-gold"
              title={t("nav_how_to_play")}
            >
              <HelpCircle size={18} />
            </button>

            {/* Logout desktop */}
            <button onClick={handleLogout} className="hidden sm:flex p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition">
              <LogOut size={18} />
            </button>

            {/* Mobile hamburger */}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition">
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-white/10 bg-white dark:bg-fifa-navy px-4 py-3 space-y-1">
            <button
              onClick={() => { setShowAvatarPicker(true); setMobileOpen(false); }}
              className="flex items-center gap-3 px-3 py-2 mb-2 w-full hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition"
            >
              <AvatarBubble avatarId={profile?.avatarId} size="md" />
              <div className="text-left">
                <p className="font-medium text-sm">{profile?.displayName}</p>
                <p className="text-xs text-gray-400">{lang === "tr" ? "Avatarı değiştir" : "Tap to change avatar"}</p>
              </div>
            </button>
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                    isActive ? "bg-fifa-blue dark:bg-fifa-gold text-white dark:text-fifa-navy"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10"
                  }`}
              >
                <Icon size={18} />{label}
              </NavLink>
            ))}
            {isAdmin && (
              <NavLink to="/admin" onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                    isActive ? "bg-purple-600 text-white" : "text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                  }`}
              >
                <Shield size={18} />{t("nav_admin")}
              </NavLink>
            )}
            <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition w-full">
              <LogOut size={18} />{t("nav_signout")}
            </button>
          </div>
        )}
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>

      {showAvatarPicker && (
        <AvatarPicker currentAvatarId={profile?.avatarId} onSelect={updateAvatar} onClose={() => setShowAvatarPicker(false)} />
      )}
      {showOnboarding && <Onboarding onDone={handleOnboardingDone} />}
    </div>
  );
}
