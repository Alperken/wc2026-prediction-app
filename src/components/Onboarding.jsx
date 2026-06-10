import React, { useState } from "react";
import { Calendar, Trophy, Users, CheckCircle2, Lock, ChevronRight, X } from "lucide-react";
import { useLang } from "../context/LangContext";

export default function Onboarding({ onDone }) {
  const { t } = useLang();
  const [step, setStep] = useState(0);

  const STEPS = [
    {
      emoji: "🏆",
      title: t("ob_step1_title"),
      subtitle: t("ob_step1_sub"),
      content: null,
    },
    {
      emoji: "📅",
      title: t("ob_step2_title"),
      subtitle: t("ob_step2_sub"),
      content: (
        <div className="space-y-3">
          <div className="flex items-start gap-3 bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
            <span className="text-2xl mt-0.5">🇲🇽</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{t("ob_step2_pick")}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t("ob_step2_pick_sub")}</p>
            </div>
            <span className="text-2xl mt-0.5">🇳🇱</span>
          </div>
          <div className="flex items-center gap-2 bg-orange-50 dark:bg-orange-900/20 rounded-xl p-3">
            <Lock size={16} className="text-orange-400 shrink-0" />
            <p className="text-xs text-orange-700 dark:text-orange-300">
              <strong>{t("ob_step2_lock")}</strong>
            </p>
          </div>
        </div>
      ),
    },
    {
      emoji: "⭐",
      title: t("ob_step3_title"),
      subtitle: t("ob_step3_sub"),
      content: (
        <div className="space-y-2.5">
          {[
            { icon: "✅", label: t("ob_step3_correct"), pts: t("ob_step3_correct_pts"), color: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-900/20" },
            { icon: "❌", label: t("ob_step3_wrong"),   pts: t("ob_step3_wrong_pts"),   color: "text-red-500 dark:text-red-400",   bg: "bg-red-50 dark:bg-red-900/20" },
            { icon: "➖", label: t("ob_step3_draw"),    pts: t("ob_step3_draw_pts"),    color: "text-gray-500",                    bg: "bg-gray-50 dark:bg-gray-800" },
          ].map((row) => (
            <div key={row.label} className={`flex items-center justify-between rounded-xl px-4 py-3 ${row.bg}`}>
              <div className="flex items-center gap-2.5">
                <span className="text-lg">{row.icon}</span>
                <span className="text-sm text-gray-700 dark:text-gray-300">{row.label}</span>
              </div>
              <span className={`text-sm font-bold ${row.color}`}>{row.pts}</span>
            </div>
          ))}
        </div>
      ),
    },
    {
      emoji: "👀",
      title: t("ob_step4_title"),
      subtitle: t("ob_step4_sub"),
      content: (
        <div className="space-y-3">
          <div className="flex items-start gap-3 bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
            <Trophy size={18} className="text-fifa-gold mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{t("ob_step4_lb")}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t("ob_step4_lb_sub")}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
            <Users size={18} className="text-blue-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{t("ob_step4_pred")}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t("ob_step4_pred_sub")}</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      emoji: "🚀",
      title: t("ob_step5_title"),
      subtitle: t("ob_step5_sub"),
      content: (
        <div className="bg-gradient-to-br from-fifa-blue/10 to-fifa-gold/10 dark:from-fifa-blue/20 dark:to-fifa-gold/10 rounded-2xl p-5 text-center">
          <p className="text-4xl mb-3">⚽</p>
          <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line">{t("ob_step5_body")}</p>
        </div>
      ),
    },
  ];

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 w-full max-w-sm shadow-2xl overflow-hidden">
        <div className="h-1 bg-gray-100 dark:bg-gray-800">
          <div className="h-full bg-gradient-to-r from-fifa-blue to-fifa-gold transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex justify-end px-4 pt-3">
          <button onClick={onDone} className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-400 transition flex items-center gap-1">
            {t("ob_skip")} <X size={12} />
          </button>
        </div>
        <div className="px-6 pb-2 pt-1">
          <div className="text-center mb-4"><span className="text-5xl">{current.emoji}</span></div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-2 whitespace-pre-line leading-tight">{current.title}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-5">{current.subtitle}</p>
          {current.content && <div className="mb-5">{current.content}</div>}
          <div className="flex justify-center gap-1.5 mb-5">
            {STEPS.map((_, i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${
                i === step ? "w-6 bg-fifa-gold" : i < step ? "w-1.5 bg-fifa-blue dark:bg-blue-400" : "w-1.5 bg-gray-200 dark:bg-gray-700"
              }`} />
            ))}
          </div>
        </div>
        <div className="px-6 pb-6">
          <button
            onClick={() => isLast ? onDone() : setStep((s) => s + 1)}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-fifa-gold to-yellow-500 hover:from-yellow-400 hover:to-fifa-gold text-fifa-navy font-bold py-3.5 rounded-xl transition shadow-lg text-sm"
          >
            {isLast ? <><CheckCircle2 size={16} /> {t("ob_done")}</> : <>{t("ob_next")} <ChevronRight size={16} /></>}
          </button>
        </div>
      </div>
    </div>
  );
}
