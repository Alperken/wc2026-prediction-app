import React, { useEffect, useState, useCallback } from "react";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LangContext";
import { collection, doc, setDoc, onSnapshot, query, where } from "firebase/firestore";
import { ALL_MATCHES, TEAM_FLAGS } from "../data/matches";
import { AvatarBubble } from "../data/avatars";
import { format, startOfWeek, endOfWeek, addWeeks, isWithinInterval, parseISO } from "date-fns";
import { tr as trLocale } from "date-fns/locale";
import { ChevronLeft, ChevronRight, MapPin, Clock, CheckCircle2, Lock } from "lucide-react";

function isPredictionLocked(matchDate) {
  return Date.now() >= new Date(matchDate).getTime() - 5 * 60 * 1000;
}

function getMatchStatus(matchDate, result) {
  const now = Date.now();
  const start = new Date(matchDate).getTime();
  if (result) return "finished";
  if (now >= start) return "live";
  if (isPredictionLocked(matchDate)) return "locked";
  return "upcoming";
}

function Countdown({ matchDate, t }) {
  const [timeLeft, setTimeLeft] = useState("");
  useEffect(() => {
    const update = () => {
      const diff = new Date(matchDate).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft(""); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(h > 0 ? `${h}h ${m}m` : m > 0 ? `${m}m ${s}s` : `${s}s`);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [matchDate]);
  if (!timeLeft) return null;
  const locksSoon = new Date(matchDate).getTime() - Date.now() < 10 * 60 * 1000;
  return (
    <span className={`text-xs font-mono font-semibold ${locksSoon ? "text-orange-400 animate-pulse" : "text-gray-400 dark:text-gray-500"}`}>
      {locksSoon ? `${t("fixtures_locks_in")} ${timeLeft}` : `${t("fixtures_starts_in")} ${timeLeft}`}
    </span>
  );
}

function PickerAvatars({ pickers, users, max = 5 }) {
  if (!pickers.length) return null;
  const shown = pickers.slice(0, max);
  const rest = pickers.length - max;
  return (
    <div className="flex items-center justify-center flex-wrap gap-1 mt-1.5">
      {shown.map((p) => {
        const u = users[p.userId];
        return (
          <div key={p.userId} title={u?.displayName || "?"} className="relative group">
            <AvatarBubble avatarId={u?.avatarId} size="xs" className="ring-2 ring-white dark:ring-gray-900" />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-0.5 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition z-10">
              {u?.displayName || "?"}
            </div>
          </div>
        );
      })}
      {rest > 0 && <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">+{rest}</span>}
    </div>
  );
}

function MatchCard({ match, userPrediction, onPredict, allPredictions, users, t, teamName, stageName }) {
  const [animating, setAnimating] = useState(null);
  const status = getMatchStatus(match.date, match.result);
  const locked = isPredictionLocked(match.date);
  const isFinished = status === "finished";

  const homeWon = match.result === "home";
  const awayWon = match.result === "away";
  const isDraw = match.result === "draw";

  const homeFlag = TEAM_FLAGS[match.home] || "🏳️";
  const awayFlag = TEAM_FLAGS[match.away] || "🏳️";
  const homeName = teamName(match.home);
  const awayName = teamName(match.away);

  const homePickers = allPredictions.filter(p => p.matchId === match.id && p.pick === "home");
  const awayPickers = allPredictions.filter(p => p.matchId === match.id && p.pick === "away");
  const total = homePickers.length + awayPickers.length;
  const homePercent = total > 0 ? Math.round((homePickers.length / total) * 100) : null;
  const awayPercent = total > 0 ? 100 - homePercent : null;

  const handlePredict = (side) => {
    if (locked) return;
    setAnimating(side);
    setTimeout(() => setAnimating(null), 400);
    onPredict(match.id, side);
  };

  return (
    <div className={`rounded-2xl border transition-all duration-200 overflow-hidden
      ${isFinished ? "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800"
      : status === "live" ? "bg-white dark:bg-gray-900 border-green-400/50 shadow-green-400/10 shadow-lg"
      : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-fifa-gold/40 hover:shadow-md"}`}
    >
      <div className="px-4 pt-3 pb-1 flex items-center justify-between">
        <span className={`text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full
          ${match.group ? "bg-fifa-blue/10 dark:bg-fifa-blue/30 text-fifa-blue dark:text-blue-300"
          : "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"}`}>
          {stageName(match.stage)}
        </span>
        <div className="flex items-center gap-2">
          {status === "live" && (
            <span className="flex items-center gap-1 text-green-400 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />{t("fixtures_live")}
            </span>
          )}
          {status === "upcoming" && <Countdown matchDate={match.date} t={t} />}
          {status === "locked" && !isFinished && (
            <span className="flex items-center gap-1 text-orange-400 text-xs font-semibold">
              <Lock size={12} /> {t("fixtures_locked")}
            </span>
          )}
        </div>
      </div>

      <div className="px-4 py-3 grid grid-cols-3 items-start gap-2">
        <div className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200
          ${userPrediction === "home" ? "bg-fifa-gold/15 ring-2 ring-fifa-gold" : ""}
          ${isFinished && homeWon ? "bg-green-500/10 ring-1 ring-green-500/40" : ""}`}>
          <span className="text-3xl">{homeFlag}</span>
          <span className="text-sm font-bold text-center leading-tight text-gray-900 dark:text-white">{homeName}</span>
          {isFinished && homeWon && <span className="text-xs text-green-500 font-semibold">{t("fixtures_won")}</span>}
          {homePercent !== null && <span className="text-xs font-bold text-fifa-blue dark:text-blue-300">{homePercent}%</span>}
          <PickerAvatars pickers={homePickers} users={users} />
        </div>

        <div className="flex flex-col items-center gap-1 pt-1">
          {isFinished ? (
            isDraw
              ? <span className="text-sm font-bold text-gray-400">{t("fixtures_draw_label")}</span>
              : <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{t("fixtures_ft")}</span>
          ) : (
            <span className="text-gray-400 dark:text-gray-600 font-bold text-lg">VS</span>
          )}
          <div className="flex flex-col items-center">
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Clock size={10} />{format(parseISO(match.date), "HH:mm")}
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-600">{format(parseISO(match.date), "MMM d")}</span>
          </div>
        </div>

        <div className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200
          ${userPrediction === "away" ? "bg-fifa-gold/15 ring-2 ring-fifa-gold" : ""}
          ${isFinished && awayWon ? "bg-green-500/10 ring-1 ring-green-500/40" : ""}`}>
          <span className="text-3xl">{awayFlag}</span>
          <span className="text-sm font-bold text-center leading-tight text-gray-900 dark:text-white">{awayName}</span>
          {isFinished && awayWon && <span className="text-xs text-green-500 font-semibold">{t("fixtures_won")}</span>}
          {awayPercent !== null && <span className="text-xs font-bold text-fifa-blue dark:text-blue-300">{awayPercent}%</span>}
          <PickerAvatars pickers={awayPickers} users={users} />
        </div>
      </div>

      <div className="px-4 pb-2 flex items-center gap-1 text-xs text-gray-400 dark:text-gray-600">
        <MapPin size={11} /><span className="truncate">{match.venue}</span>
      </div>

      <div className="px-4 pb-4">
        {match.home === "TBD" || match.away === "TBD" ? (
          <div className="text-center py-2 text-xs text-gray-400 dark:text-gray-600 italic">{t("fixtures_tbd")}</div>
        ) : locked ? (
          <div className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium
            ${userPrediction ? "bg-fifa-gold/10 text-fifa-gold border border-fifa-gold/30" : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600"}`}>
            {userPrediction ? (
              <>
                <CheckCircle2 size={16} />
                {t("fixtures_your_pick")}: {userPrediction === "home" ? homeName : awayName}
                {isFinished && (
                  <span className={`ml-1 text-xs font-bold ${
                    (userPrediction === "home" && homeWon) || (userPrediction === "away" && awayWon)
                      ? "text-green-400" : isDraw ? "text-gray-400" : "text-red-400"}`}>
                    {(userPrediction === "home" && homeWon) || (userPrediction === "away" && awayWon)
                      ? t("fixtures_correct") : isDraw ? t("fixtures_draw") : t("fixtures_wrong")}
                  </span>
                )}
              </>
            ) : (
              <><Lock size={16} /> {t("fixtures_no_prediction")}</>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => handlePredict("home")}
              className={`relative py-3 px-3 rounded-xl text-sm font-bold transition-all duration-200
                ${userPrediction === "home"
                  ? "bg-fifa-gold text-fifa-navy shadow-lg shadow-fifa-gold/25 scale-[1.02]"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-fifa-gold/20 hover:text-fifa-gold active:scale-95"
                } ${animating === "home" ? "scale-95" : ""}`}
            >
              <span className="flex items-center justify-center gap-1.5">{homeFlag} {homeName}</span>
              {userPrediction === "home" && <span className="absolute top-1 right-1.5 text-xs">✓</span>}
            </button>
            <button onClick={() => handlePredict("away")}
              className={`relative py-3 px-3 rounded-xl text-sm font-bold transition-all duration-200
                ${userPrediction === "away"
                  ? "bg-fifa-gold text-fifa-navy shadow-lg shadow-fifa-gold/25 scale-[1.02]"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-fifa-gold/20 hover:text-fifa-gold active:scale-95"
                } ${animating === "away" ? "scale-95" : ""}`}
            >
              <span className="flex items-center justify-center gap-1.5">{awayFlag} {awayName}</span>
              {userPrediction === "away" && <span className="absolute top-1 right-1.5 text-xs">✓</span>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Fixtures() {
  const { user } = useAuth();
  const { t, teamName, stageName, lang } = useLang();
  const locale = lang === "tr" ? trLocale : undefined;
  const [weekOffset, setWeekOffset] = useState(0);
  const [predictions, setPredictions] = useState({});
  const [allPredictions, setAllPredictions] = useState([]);
  const [firestoreMatches, setFirestoreMatches] = useState({});
  const [users, setUsers] = useState({});

  const baseDate = new Date("2026-06-11");
  const weekStart = startOfWeek(addWeeks(baseDate, weekOffset), { weekStartsOn: 4 });
  const weekEnd = endOfWeek(addWeeks(baseDate, weekOffset), { weekStartsOn: 4 });
  const weekLabel = `${format(weekStart, "d MMM", { locale })} – ${format(weekEnd, "d MMM", { locale })}`;

  const weekMatches = ALL_MATCHES.filter((m) =>
    isWithinInterval(parseISO(m.date), { start: weekStart, end: weekEnd })
  );

  useEffect(() => {
    if (!user) return;
    return onSnapshot(query(collection(db, "predictions"), where("userId", "==", user.uid)), (snap) => {
      const preds = {};
      snap.forEach((d) => { preds[d.data().matchId] = d.data().pick; });
      setPredictions(preds);
    });
  }, [user]);

  useEffect(() => {
    return onSnapshot(collection(db, "predictions"), (snap) => {
      setAllPredictions(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
  }, []);

  useEffect(() => {
    return onSnapshot(collection(db, "matches"), (snap) => {
      const m = {};
      snap.forEach((d) => { m[d.id] = d.data(); });
      setFirestoreMatches(m);
    });
  }, []);

  useEffect(() => {
    return onSnapshot(collection(db, "users"), (snap) => {
      const u = {};
      snap.forEach((d) => { u[d.id] = d.data(); });
      setUsers(u);
    });
  }, []);

  const handlePredict = useCallback(async (matchId, pick) => {
    if (!user) return;
    const match = ALL_MATCHES.find((m) => m.id === matchId);
    if (!match || isPredictionLocked(match.date)) return;
    await setDoc(doc(db, "predictions", `${user.uid}_${matchId}`), {
      userId: user.uid, matchId, pick, createdAt: Date.now(),
    });
  }, [user]);

  const enrichedMatches = weekMatches.map((m) => ({ ...m, ...(firestoreMatches[m.id] || {}) }));
  const groupedByDay = enrichedMatches.reduce((acc, m) => {
    const day = format(parseISO(m.date), "EEEE, MMMM d", { locale });
    if (!acc[day]) acc[day] = [];
    acc[day].push(m);
    return acc;
  }, {});

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("fixtures_title")}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {format(weekStart, "MMM d", { locale })} – {format(weekEnd, "MMM d, yyyy", { locale })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setWeekOffset((w) => w - 1)}
            className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-fifa-gold/50 transition">
            <ChevronLeft size={18} />
          </button>
          <button onClick={() => setWeekOffset(0)}
            className="px-3 py-1.5 text-sm font-semibold rounded-lg bg-fifa-blue dark:bg-fifa-gold text-white dark:text-fifa-navy hover:opacity-90 transition min-w-[110px] text-center">
            {weekLabel}
          </button>
          <button onClick={() => setWeekOffset((w) => w + 1)}
            className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-fifa-gold/50 transition">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {weekMatches.length === 0 ? (
        <div className="text-center py-20 text-gray-400 dark:text-gray-600">
          <span className="text-5xl block mb-4">📅</span>
          <p className="text-lg font-medium">{t("fixtures_no_matches")}</p>
          <p className="text-sm mt-1">{t("fixtures_no_matches_sub")}</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedByDay).map(([day, matches]) => (
            <div key={day}>
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
                <span className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
                {day}
                <span className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {matches.map((match) => (
                  <MatchCard key={match.id} match={match}
                    userPrediction={predictions[match.id]}
                    onPredict={handlePredict}
                    allPredictions={allPredictions}
                    users={users} t={t} teamName={teamName} stageName={stageName}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
