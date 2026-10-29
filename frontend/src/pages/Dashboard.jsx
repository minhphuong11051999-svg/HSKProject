import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyStats } from '../api/lessons';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getMyStats().then(setStats).catch(() => setStats(null));
  }, []);

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      <div className="mb-8">
        <p className="zh text-xl text-coral-500">写作工坊</p>
        <h1 className="text-2xl md:text-3xl font-bold mt-1">Xin chào, {user.name} 👋</h1>
        <p className="text-slate-400 mt-1">Giữ vững chuỗi học và tiếp tục luyện viết mỗi ngày.</p>
      </div>

      {stats && (
        <>
          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            <StreakCard streak={stats.currentStreak} />
            <LevelCard level={stats.level} xpIntoLevel={stats.xpIntoLevel} xpPerLevel={stats.xpPerLevel} />
          </div>

          <div className="bg-night-800 border border-night-700 rounded-xl p-5 mb-6">
            <h2 className="font-bold mb-4">Bắt đầu luyện tập</h2>
            <div className="grid sm:grid-cols-3 gap-3">
              <QuickLink to="/lessons/practice" emoji="📝" label="Đề mẫu" color="from-coral-500 to-coral-600" />
              <QuickLink to="/lessons/exam" emoji="🎯" label="Đề thi thật" color="from-indigo-600 to-indigo-900" />
              <QuickLink to="/history" emoji="🕘" label="Lịch sử làm bài" color="from-night-600 to-night-700" />
            </div>
          </div>

          <ActivityHeatmap activity={stats.activity} />

          <div className="grid sm:grid-cols-3 gap-4 mt-4">
            <SummaryStat label="Ngày có học" value={`${stats.daysActiveInWindow}/${stats.windowDays}`} />
            <SummaryStat label="Tổng số bài đã làm" value={stats.totalSubmissions} />
            <SummaryStat label="Chuỗi dài nhất" value={`${stats.longestStreak} ngày`} />
          </div>
        </>
      )}
    </main>
  );
}

function StreakCard({ streak }) {
  return (
    <div className="bg-night-800 border border-night-700 rounded-xl p-5 flex items-center gap-4">
      <span className="text-4xl">🔥</span>
      <div>
        <p className="text-xs text-slate-500">Streak hiện tại</p>
        <p className="text-2xl font-bold">{streak} ngày</p>
      </div>
    </div>
  );
}

function LevelCard({ level, xpIntoLevel, xpPerLevel }) {
  const pct = Math.round((xpIntoLevel / xpPerLevel) * 100);
  return (
    <div className="bg-night-800 border border-night-700 rounded-xl p-5">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-slate-500">Level hiện tại</p>
        <span className="text-xs text-slate-500">
          {xpIntoLevel}/{xpPerLevel} XP
        </span>
      </div>
      <p className="text-2xl font-bold mb-2">Level {level}</p>
      <div className="h-2 bg-night-900 rounded-full overflow-hidden">
        <div className="h-full bg-coral-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function QuickLink({ to, emoji, label, color }) {
  return (
    <Link
      to={to}
      className={`bg-gradient-to-r ${color} rounded-lg p-4 text-center text-white font-semibold hover:brightness-110 transition-all`}
    >
      <div className="text-2xl mb-1">{emoji}</div>
      {label}
    </Link>
  );
}

function SummaryStat({ label, value }) {
  return (
    <div className="bg-night-800 border border-night-700 rounded-xl p-4 text-center">
      <p className="text-xl font-bold text-coral-400">{value}</p>
      <p className="text-xs text-slate-500 mt-1">{label}</p>
    </div>
  );
}

function ActivityHeatmap({ activity }) {
  // Group days into weeks (columns of 7), oldest first.
  const weeks = [];
  for (let i = 0; i < activity.length; i += 7) {
    weeks.push(activity.slice(i, i + 7));
  }

  return (
    <div className="bg-night-800 border border-night-700 rounded-xl p-5">
      <h2 className="font-bold mb-1">90 ngày gần nhất</h2>
      <p className="text-xs text-slate-500 mb-4">Mỗi ô là một ngày. Ô sáng màu = có làm bài hôm đó.</p>
      <div className="flex gap-1 overflow-x-auto pb-2">
        {weeks.map((week, wIdx) => (
          <div key={wIdx} className="flex flex-col gap-1">
            {week.map((day) => (
              <div
                key={day.date}
                title={day.date}
                className={`w-3 h-3 rounded-sm ${day.active ? 'bg-coral-500' : 'bg-night-700'}`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-3 text-xs text-slate-500">
        <span>Ít</span>
        <span className="w-3 h-3 rounded-sm bg-night-700 inline-block" />
        <span className="w-3 h-3 rounded-sm bg-coral-500 inline-block" />
        <span>Nhiều</span>
      </div>
    </div>
  );
}
