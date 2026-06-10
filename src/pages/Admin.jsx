import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase/config";
import { collection, doc, setDoc, onSnapshot, updateDoc, deleteDoc, writeBatch, getDocs, query, where } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ALL_MATCHES, TEAM_FLAGS } from "../data/matches";
import { useLang } from "../context/LangContext";
import { format, parseISO } from "date-fns";
import { tr as trLocale } from "date-fns/locale";
import { UserPlus, Trophy, Users, Trash2 } from "lucide-react";

function UsersTab({ t }) {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ displayName: "", email: "", password: "", role: "player" });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    return onSnapshot(collection(db, "users"), (snap) => {
      setUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
  }, []);

  const createUser = async () => {
    if (!form.displayName || !form.email || !form.password) { setMsg(t("admin_fields_required")); return; }
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, form.email, form.password);
      await setDoc(doc(db, "users", cred.user.uid), {
        displayName: form.displayName, email: form.email, role: form.role,
        points: 0, correctPredictions: 0, totalPredictions: 0, createdAt: Date.now(),
      });
      setForm({ displayName: "", email: "", password: "", role: "player" });
      setMsg(t("admin_created_ok"));
    } catch (e) { setMsg("Error: " + e.message); }
    setLoading(false);
  };

  const deleteUser = async (uid) => {
    if (!window.confirm(t("admin_delete_confirm"))) return;
    await deleteDoc(doc(db, "users", uid));
  };

  return (
    <div className="space-y-6">
      <div className="p-5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <UserPlus size={18} className="text-fifa-gold" /> {t("admin_add_user")}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          {[
            { ph: t("admin_display_name"), val: "displayName", type: "text" },
            { ph: t("admin_email"),        val: "email",       type: "email" },
            { ph: t("admin_password"),     val: "password",    type: "password" },
          ].map(({ ph, val, type }) => (
            <input key={val} placeholder={ph} type={type} value={form[val]}
              onChange={(e) => setForm({ ...form, [val]: e.target.value })}
              className="px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-fifa-gold"
            />
          ))}
          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-fifa-gold">
            <option value="player">{t("admin_role_player")}</option>
            <option value="admin">{t("admin_role_admin")}</option>
          </select>
        </div>
        {msg && <p className={`text-sm mb-3 ${msg.startsWith("✓") ? "text-green-500" : "text-red-400"}`}>{msg}</p>}
        <button onClick={createUser} disabled={loading}
          className="bg-fifa-gold hover:bg-yellow-400 text-fifa-navy font-bold px-5 py-2.5 rounded-xl transition disabled:opacity-50">
          {loading ? t("admin_creating") : t("admin_create")}
        </button>
      </div>

      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-900">
        <div className="px-5 py-3 bg-gray-50 dark:bg-gray-800/50 text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2">
          <Users size={14} /> {users.length} {t("admin_tab_users")}
        </div>
        {users.map((u) => (
          <div key={u.id} className="px-5 py-3.5 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-fifa-gold to-yellow-600 flex items-center justify-center text-sm font-bold text-fifa-navy">
                {u.displayName?.[0]?.toUpperCase() || "?"}
              </div>
              <div>
                <p className="font-semibold text-sm text-gray-900 dark:text-white">{u.displayName}</p>
                <p className="text-xs text-gray-400">{u.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs px-2 py-1 rounded-full font-semibold
                ${u.role === "admin" ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"}`}>
                {u.role === "admin" ? t("admin_role_admin") : t("admin_role_player")}
              </span>
              <span className="text-sm font-bold text-fifa-gold">{u.points || 0} pts</span>
              <button onClick={() => deleteUser(u.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition">
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ResultsTab({ t, teamName, stageName, lang }) {
  const locale = lang === "tr" ? trLocale : undefined;
  const [firestoreMatches, setFirestoreMatches] = useState({});
  const [saving, setSaving] = useState({});
  const [msg, setMsg] = useState("");
  const [stageFilter, setStageFilter] = useState("group");

  useEffect(() => {
    return onSnapshot(collection(db, "matches"), (snap) => {
      const m = {};
      snap.forEach((d) => { m[d.id] = d.data(); });
      setFirestoreMatches(m);
    });
  }, []);

  const saveResult = async (matchId, result) => {
    setSaving((s) => ({ ...s, [matchId]: true }));
    try {
      const matchData = ALL_MATCHES.find((m) => m.id === matchId);
      await setDoc(doc(db, "matches", matchId), { ...matchData, result, resultSetAt: Date.now() });
      await recalculateScores(matchId, result);
      setMsg(t("admin_result_saved"));
      setTimeout(() => setMsg(""), 3000);
    } catch (e) { setMsg("Error: " + e.message); }
    setSaving((s) => ({ ...s, [matchId]: false }));
  };

  const recalculateScores = async (matchId, result) => {
    const predsSnap = await getDocs(query(collection(db, "predictions"), where("matchId", "==", matchId)));
    const batch = writeBatch(db);
    const userUpdates = {};
    predsSnap.forEach((d) => {
      const pred = d.data();
      const correct = pred.pick === result;
      const isDraw = result === "draw";
      if (!userUpdates[pred.userId]) userUpdates[pred.userId] = { pointsDelta: 0, correctDelta: 0, totalDelta: 0 };
      userUpdates[pred.userId].totalDelta += 1;
      if (!isDraw && correct) { userUpdates[pred.userId].pointsDelta += 1; userUpdates[pred.userId].correctDelta += 1; }
      batch.update(doc(db, "predictions", d.id), { processed: true, gotPoint: correct && !isDraw });
    });
    const usersSnap = await getDocs(collection(db, "users"));
    usersSnap.forEach((d) => {
      if (userUpdates[d.id]) {
        const { pointsDelta, correctDelta, totalDelta } = userUpdates[d.id];
        batch.update(doc(db, "users", d.id), {
          points: (d.data().points || 0) + pointsDelta,
          correctPredictions: (d.data().correctPredictions || 0) + correctDelta,
          totalPredictions: (d.data().totalPredictions || 0) + totalDelta,
        });
      }
    });
    await batch.commit();
  };

  const filteredMatches = ALL_MATCHES.filter((m) => {
    if (stageFilter === "group") return !!m.group;
    if (stageFilter === "knockout") return !m.group;
    return true;
  }).filter((m) => m.home !== "TBD" && m.away !== "TBD");

  return (
    <div className="space-y-4">
      {msg && (
        <div className={`px-4 py-3 rounded-xl text-sm font-medium ${
          msg.startsWith("✓") ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
          : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"}`}>{msg}</div>
      )}
      <div className="flex gap-2 mb-2">
        {["group", "knockout"].map((f) => (
          <button key={f} onClick={() => setStageFilter(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase transition ${
              stageFilter === f
                ? "bg-fifa-blue dark:bg-fifa-gold text-white dark:text-fifa-navy"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"}`}>
            {f === "group" ? t("admin_group_stage") : t("admin_knockout")}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {filteredMatches.map((match) => {
          const current = firestoreMatches[match.id];
          const hasResult = current?.result;
          const homeFlag = TEAM_FLAGS[match.home] || "🏳️";
          const awayFlag = TEAM_FLAGS[match.away] || "🏳️";
          const homeName = teamName(match.home);
          const awayName = teamName(match.away);
          return (
            <div key={match.id} className={`p-4 rounded-2xl border transition
              ${hasResult ? "bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900/30"
              : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"}`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-gray-400 mb-1">{stageName(match.stage)} · {format(parseISO(match.date), "d MMM, HH:mm", { locale })}</p>
                  <p className="font-bold text-gray-900 dark:text-white text-sm">
                    {homeFlag} {homeName} vs {awayName} {awayFlag}
                  </p>
                  {hasResult && (
                    <p className="text-xs text-green-600 dark:text-green-400 font-semibold mt-1">
                      ✓ {hasResult === "home" ? homeName : hasResult === "away" ? awayName : t("admin_draw")} {t("admin_wins")}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {[
                    { val: "home", label: `${homeFlag} ${homeName} ${t("admin_wins")}` },
                    { val: "draw", label: t("admin_draw") },
                    { val: "away", label: `${awayFlag} ${awayName} ${t("admin_wins")}` },
                  ].map(({ val, label }) => (
                    <button key={val} onClick={() => saveResult(match.id, val)} disabled={saving[match.id]}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition
                        ${current?.result === val
                          ? val === "draw" ? "bg-gray-500 text-white" : "bg-green-500 text-white"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-fifa-gold/20"}`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Admin() {
  const { t, teamName, stageName, lang } = useLang();
  const [tab, setTab] = useState("users");
  const tabs = [
    { id: "users",   label: t("admin_tab_users"),   icon: Users },
    { id: "results", label: t("admin_tab_results"),  icon: Trophy },
  ];
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("admin_title")}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">{t("admin_subtitle")}</p>
      </div>
      <div className="flex gap-1 mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${
              tab === id ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"}`}>
            <Icon size={15} />{label}
          </button>
        ))}
      </div>
      {tab === "users"   && <UsersTab t={t} />}
      {tab === "results" && <ResultsTab t={t} teamName={teamName} stageName={stageName} lang={lang} />}
    </div>
  );
}
