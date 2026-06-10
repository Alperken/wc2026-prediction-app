import React, { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { collection, onSnapshot } from "firebase/firestore";
import { ALL_MATCHES, TEAM_FLAGS } from "../data/matches";
import { useLang } from "../context/LangContext";
import { AvatarBubble } from "../data/avatars";
import { format, parseISO } from "date-fns";
import { tr as trLocale } from "date-fns/locale";
import { EyeOff, CheckCircle2, XCircle, Minus } from "lucide-react";

export default function Predictions() {
  const { t, teamName, stageName, lang } = useLang();
  const locale = lang === "tr" ? trLocale : undefined;
  const [allPredictions, setAllPredictions] = useState([]);
  const [users, setUsers] = useState({});
  const [firestoreMatches, setFirestoreMatches] = useState({});
  const [selectedStage, setSelectedStage] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const u1 = onSnapshot(collection(db, "predictions"), (snap) => {
      setAllPredictions(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    const u2 = onSnapshot(collection(db, "users"), (snap) => {
      const u = {};
      snap.forEach((d) => { u[d.id] = d.data(); });
      setUsers(u);
    });
    const u3 = onSnapshot(collection(db, "matches"), (snap) => {
      const m = {};
      snap.forEach((d) => { m[d.id] = d.data(); });
      setFirestoreMatches(m);
    });
    return () => { u1(); u2(); u3(); };
  }, []);

  const stages = ["all", "Group Stage", "Round of 32", "Round of 16", "Quarter-final", "Semi-final", "Final"];

  const stageLabel = (s) => {
    if (s === "all") return t("pred_all");
    if (s === "Group Stage") return stageName("Group A").replace("A", "").trim() + "lar" === "Gruplar"
      ? "Gruplar" : "Groups"; // fallback
    return stageName(s);
  };

  const visibleMatches = ALL_MATCHES.filter((m) => {
    const hasPred = allPredictions.some(p => p.matchId === m.id);
    if (!hasPred) return false;
    if (selectedStage === "all") return true;
    if (selectedStage === "Group Stage") return !!m.group;
    return m.stage === selectedStage;
  });

  const predsByMatch = {};
  allPredictions.forEach((p) => {
    if (!predsByMatch[p.matchId]) predsByMatch[p.matchId] = [];
    predsByMatch[p.matchId].push(p);
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-fifa-gold border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("pred_title")}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">{t("pred_subtitle")}</p>
      </div>

      {/* Stage filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        {stages.map((s) => (
          <button key={s} onClick={() => setSelectedStage(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
              selectedStage === s
                ? "bg-fifa-blue dark:bg-fifa-gold text-white dark:text-fifa-navy"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            {s === "all" ? t("pred_all") : s === "Group Stage" ? stageName("Group A").split(" ")[0] + " " + t("nav_fixtures") : stageName(s)}
          </button>
        ))}
      </div>

      {visibleMatches.length === 0 ? (
        <div className="text-center py-20 text-gray-400 dark:text-gray-600">
          <EyeOff size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">{t("pred_no_predictions")}</p>
          <p className="text-sm mt-1">{t("pred_no_predictions_sub")}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {visibleMatches.map((match) => {
            const matchResult = firestoreMatches[match.id];
            const result = matchResult?.result;
            const preds = predsByMatch[match.id] || [];
            const homeFlag = TEAM_FLAGS[match.home] || "🏳️";
            const awayFlag = TEAM_FLAGS[match.away] || "🏳️";
            const homeName = teamName(match.home);
            const awayName = teamName(match.away);

            const homePickers = preds.filter((p) => p.pick === "home");
            const awayPickers = preds.filter((p) => p.pick === "away");
            const total = preds.length;
            const homePercent = total > 0 ? Math.round((homePickers.length / total) * 100) : 50;
            const awayPercent = 100 - homePercent;

            return (
              <div key={match.id} className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                      {stageName(match.stage)} · {format(parseISO(match.date), "d MMM, HH:mm", { locale })}
                    </span>
                    {result && (
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        result === "draw"
                          ? "bg-gray-100 dark:bg-gray-800 text-gray-500"
                          : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"}`}>
                        {t("fixtures_ft")} · {result === "home" ? homeName : result === "away" ? awayName : t("fixtures_draw_label")}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-base font-bold text-gray-900 dark:text-white">
                    <span>{homeFlag} {homeName}</span>
                    <span className="text-gray-300 dark:text-gray-600">vs</span>
                    <span>{awayName} {awayFlag}</span>
                  </div>
                </div>

                {total > 0 ? (
                  <div className="px-5 py-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-bold text-gray-500 w-8 text-right">{homePercent}%</span>
                      <div className="flex-1 h-3 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 flex">
                        <div className="bg-fifa-blue dark:bg-fifa-gold h-full rounded-l-full transition-all duration-500" style={{ width: `${homePercent}%` }} />
                        <div className="bg-gray-400 dark:bg-gray-600 h-full rounded-r-full transition-all duration-500" style={{ width: `${awayPercent}%` }} />
                      </div>
                      <span className="text-xs font-bold text-gray-500 w-8">{awayPercent}%</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                      {preds.map((p) => {
                        const uProfile = users[p.userId];
                        const isCorrect = result && p.pick === result;
                        const isWrong = result && p.pick !== result && result !== "draw";
                        const isDraw = result === "draw";
                        return (
                          <div key={p.id}
                            className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm
                              ${isCorrect ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                              : isWrong ? "bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30"
                              : "bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700"}`}
                          >
                            <div className="flex items-center gap-2">
                              <AvatarBubble avatarId={uProfile?.avatarId} size="xs" />
                              <span className="font-medium text-gray-700 dark:text-gray-300">{uProfile?.displayName || "?"}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-gray-600 dark:text-gray-400">
                                {p.pick === "home" ? `${homeFlag} ${homeName}` : `${awayFlag} ${awayName}`}
                              </span>
                              {isCorrect && <CheckCircle2 size={14} className="text-green-500" />}
                              {isWrong && <XCircle size={14} className="text-red-400" />}
                              {isDraw && <Minus size={14} className="text-gray-400" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="px-5 py-6 text-center text-gray-400 dark:text-gray-600 text-sm">
                    {t("pred_no_match_preds")}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
