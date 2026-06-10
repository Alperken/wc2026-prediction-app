import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LangContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { login } = useAuth();
  const { t, lang, toggleLang } = useLang();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/fixtures");
    } catch {
      setError(t("login_error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-fifa-navy via-fifa-blue to-fifa-navy px-4">
      <div className="absolute inset-0 opacity-5 pointer-events-none"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }}
      />

      {/* Lang toggle on login */}
      <button
        onClick={toggleLang}
        className="absolute top-4 right-4 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition text-sm font-bold text-white"
      >
        {lang === "en" ? "🇹🇷 TR" : "🇬🇧 EN"}
      </button>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-fifa-gold to-yellow-600 shadow-2xl mb-4">
            <span className="text-4xl">🏆</span>
          </div>
          <h1 className="font-display text-5xl text-white tracking-widest mb-1">WC 2026</h1>
          <p className="text-fifa-gold text-sm font-semibold tracking-[0.3em] uppercase">{t("login_title")}</p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8 shadow-2xl">
          <h2 className="text-white text-xl font-semibold mb-6 text-center">{t("login_heading")}</h2>
          {error && (
            <div className="bg-red-500/20 border border-red-500/40 text-red-300 text-sm rounded-lg px-4 py-3 mb-5">{error}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-gray-300 text-sm font-medium block mb-1.5">{t("login_email")}</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com" required
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-fifa-gold focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="text-gray-300 text-sm font-medium block mb-1.5">{t("login_password")}</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" required
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-fifa-gold focus:border-transparent transition"
              />
            </div>
            <button type="submit" disabled={loading}
              className="w-full mt-2 bg-gradient-to-r from-fifa-gold to-yellow-500 hover:from-yellow-400 hover:to-fifa-gold text-fifa-navy font-bold py-3 rounded-xl transition-all duration-200 shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? t("login_loading") : t("login_button")}
            </button>
          </form>
          <p className="text-gray-500 text-xs text-center mt-6">{t("login_hint")}</p>
        </div>
        <p className="text-center text-white/20 text-xs mt-6">{t("login_subtitle")}</p>
      </div>
    </div>
  );
}
