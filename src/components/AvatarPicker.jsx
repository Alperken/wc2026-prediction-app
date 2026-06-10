import React, { useState } from "react";
import { AVATARS, AvatarBubble } from "../data/avatars";
import { useLang } from "../context/LangContext";
import { Check, X } from "lucide-react";

export default function AvatarPicker({ currentAvatarId, onSelect, onClose }) {
  const { t } = useLang();
  const [selected, setSelected] = useState(currentAvatarId || "lion");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h2 className="font-bold text-lg text-gray-900 dark:text-white">{t("av_title")}</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t("av_subtitle")}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
            <X size={18} className="text-gray-500" />
          </button>
        </div>
        <div className="flex flex-col items-center py-5 border-b border-gray-100 dark:border-gray-800">
          <AvatarBubble avatarId={selected} size="xl" className="shadow-xl mb-2" />
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            {AVATARS.find(a => a.id === selected)?.label}
          </p>
        </div>
        <div className="p-4 grid grid-cols-5 gap-2 max-h-64 overflow-y-auto">
          {AVATARS.map((av) => (
            <button key={av.id} onClick={() => setSelected(av.id)}
              className={`relative flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-150
                ${selected === av.id ? "ring-2 ring-fifa-gold scale-105" : "hover:bg-gray-50 dark:hover:bg-gray-800"}`}
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-md" style={{ backgroundColor: av.bg }}>
                {av.emoji}
              </div>
              {selected === av.id && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-fifa-gold rounded-full flex items-center justify-center">
                  <Check size={11} className="text-fifa-navy" />
                </div>
              )}
              <span className="text-xs text-gray-500 dark:text-gray-400 truncate w-full text-center">{av.label}</span>
            </button>
          ))}
        </div>
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={() => { onSelect(selected); onClose(); }}
            className="w-full bg-gradient-to-r from-fifa-gold to-yellow-500 hover:from-yellow-400 hover:to-fifa-gold text-fifa-navy font-bold py-3 rounded-xl transition shadow-lg"
          >
            {t("av_save")}
          </button>
        </div>
      </div>
    </div>
  );
}
