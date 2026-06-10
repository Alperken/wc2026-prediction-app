import React, { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LangContext";
import { collection, onSnapshot } from "firebase/firestore";
import { Trophy, TrendingUp, Target, Award } from "lucide-react";
import { AvatarBubble } from "../data/avatars";

const MEDALS = ["🥇", "🥈", "🥉"];

function StatBadge({ icon: Icon, label, value, color }) {
  return (
    <div className="flex flex-col items-center p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
      <Icon size={16} className={color} />
      <span className="text-xl font-bold mt-1 text-gray-900 dark:text-white">{value}</span>
      <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
    </div>
  );
}

export default function Leaderboard() {
  const { user } = useAuth();
  const { t } = useLang();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onSnapshot(collection(db, "users"), (snap) => {
      const list = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (b.points || 0) - (a.points || 0));
      setUsers(list);
      setLoading(false);
    });
  }, []);

  const currentUser = users.find((u) => u.id === user?.uid);
  const currentRank = users.findIndex((u) => u.id === user?.uid) + 1;

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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("lb_title")}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {users.length} {t("lb_subtitle_players")}
        </p>
      </div>

      {currentUser && (
        <div className="mb-6 p-5 rounded-2xl bg-gradient-to-r from-fifa-blue to-blue-700 dark:from-fifa-navy dark:to-blue-900 border border-fifa-gold/30 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <AvatarBubble avatarId={currentUser.avatarId} size="lg" className="shadow-lg" />
              <div>
                <p className="font-bold text-white text-lg">{currentUser.displayName}</p>
                <p className="text-blue-200 text-sm">{t("lb_your_stats")}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-fifa-gold">{currentUser.points || 0}</p>
              <p className="text-blue-200 text-sm">{t("lb_points")}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <StatBadge icon={Award}     label={t("lb_rank")}    value={`#${currentRank}`}                     color="text-fifa-gold" />
            <StatBadge icon={Target}    label={t("lb_correct")} value={currentUser.correctPredictions || 0}   color="text-green-400" />
            <StatBadge icon={TrendingUp} label={t("lb_total")}  value={currentUser.totalPredictions || 0}     color="text-blue-400" />
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-900">
        <div className="px-5 py-3 bg-gray-50 dark:bg-gray-800/50 grid grid-cols-12 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          <span className="col-span-1">#</span>
          <span className="col-span-5">{t("lb_player")}</span>
          <span className="col-span-2 text-center">{t("lb_correct")}</span>
          <span className="col-span-2 text-center">{t("lb_total")}</span>
          <span className="col-span-2 text-right">{t("lb_points")}</span>
        </div>

        {users.map((u, i) => {
          const isMe = u.id === user?.uid;
          const accuracy = u.totalPredictions > 0
            ? Math.round((u.correctPredictions / u.totalPredictions) * 100) : 0;
          return (
            <div key={u.id}
              className={`px-5 py-4 grid grid-cols-12 items-center border-t transition
                ${isMe ? "bg-fifa-gold/5 dark:bg-fifa-gold/10 border-fifa-gold/20"
                : "border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/40"}`}
            >
              <div className="col-span-1">
                {i < 3
                  ? <span className="text-xl">{MEDALS[i]}</span>
                  : <span className="text-sm font-bold text-gray-400 dark:text-gray-600">{i + 1}</span>}
              </div>
              <div className="col-span-5 flex items-center gap-3">
                <AvatarBubble avatarId={u.avatarId} size="sm" className={`ring-2 ${
                  i === 0 ? "ring-yellow-400" : i === 1 ? "ring-gray-400" : i === 2 ? "ring-amber-600" : "ring-gray-200 dark:ring-gray-700"
                }`} />
                <div>
                  <p className={`font-semibold text-sm ${isMe ? "text-fifa-gold" : "text-gray-900 dark:text-white"}`}>
                    {u.displayName}
                    {isMe && <span className="ml-1 text-xs text-fifa-gold/70">({t("lb_you")})</span>}
                  </p>
                  <p className="text-xs text-gray-400">{accuracy}% {t("lb_accuracy")}</p>
                </div>
              </div>
              <div className="col-span-2 text-center">
                <span className="text-sm font-bold text-green-600 dark:text-green-400">{u.correctPredictions || 0}</span>
              </div>
              <div className="col-span-2 text-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">{u.totalPredictions || 0}</span>
              </div>
              <div className="col-span-2 text-right">
                <span className={`text-lg font-bold ${
                  i === 0 ? "text-yellow-500" : i === 1 ? "text-gray-400" : i === 2 ? "text-amber-600" : "text-gray-700 dark:text-gray-300"
                }`}>{u.points || 0}</span>
              </div>
            </div>
          );
        })}

        {users.length === 0 && (
          <div className="text-center py-16 text-gray-400 dark:text-gray-600">
            <Trophy size={40} className="mx-auto mb-3 opacity-30" />
            <p>{t("lb_no_players")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
