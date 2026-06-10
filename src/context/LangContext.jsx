import React, { createContext, useContext, useState } from "react";
import { TRANSLATIONS, TEAM_NAMES, STAGE_NAMES } from "../data/translations";

const LangContext = createContext();

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem("wc2026-lang") || "en");

  const toggleLang = () => {
    const next = lang === "en" ? "tr" : "en";
    setLang(next);
    localStorage.setItem("wc2026-lang", next);
  };

  const t = (key) => TRANSLATIONS[lang]?.[key] || TRANSLATIONS.en[key] || key;
  const teamName = (name) => TEAM_NAMES[lang]?.[name] || name;
  const stageName = (name) => STAGE_NAMES[lang]?.[name] || name;

  return (
    <LangContext.Provider value={{ lang, toggleLang, t, teamName, stageName }}>
      {children}
    </LangContext.Provider>
  );
}

export const useLang = () => useContext(LangContext);
