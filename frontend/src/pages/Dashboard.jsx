import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyStats } from '../api/lessons';
import { motion } from 'motion/react';
import { CountingNumber } from '@animate-ui/react/primitives/texts/counting-number';
import Reveal from '../components/motion/Reveal';
import { BookOpen, NotePencil, Target, ClockCounterClockwise, Flame } from '@phosphor-icons/react';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getMyStats().then(setStats).catch(() => setStats(null));
  }, []);

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <div className="mb-8">
        <p className="zh text-xl text-coral-400">写作工坊</p>
        <h1 className="text-2xl md:text-3xl font-bold mt-1">
          Xin chào, {user.name}
        </h1>
        <p className="text-slate-400 mt-1">Giữ vững chuỗi học và tiếp tục luyện viết mỗi ngày.</p>
      </div>

      {stats && (
        <>
          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            <Reveal index={0}>
              <StreakCard streak={stats.currentStreak} />
            </Reveal>
            <Reveal index={1}>
              <LevelCard level={stats.level} xpIntoLevel={stats.xpIntoLevel} xpPerLevel={stats.xpPerLevel} />
            </Reveal>
          </div>

          <Reveal index={2}>
            <div className="bg-night-800 border border-night-700 rounded-xl p-5 mb-6">
              <h2 className="font-bold mb-4">Bắt đầu luyện tập</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <QuickLink to="/lessons" icon={BookOpen} label="Bài học" />
                <QuickLink to="/practice" icon={NotePencil} label="Đề mẫu" />
                <QuickLink to="/lessons/exam" icon={Target} label="Đề thi thật" />
                <QuickLink to="/history" icon={ClockCounterClockwise} label="Lịch sử làm bài" />
              </div>
            </div>
          </Reveal>

          <Reveal index={3}>
            <ActivityHeatmap activity={stats.activity} />
          </Reveal>

          <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-4">
            <Reveal index={4}>
              <SummaryStat label="Ngày có học">
                <CountingNumber number={stats.daysActiveInWindow} />/{stats.windowDays}
              </SummaryStat>
            </Reveal>
            <Reveal index={5}>
              <SummaryStat label="Tổng số bài đã làm">
                <CountingNumber number={stats.totalSubmissions} />
              </SummaryStat>
            </Reveal>
            <Reveal index={6}>
              <SummaryStat label="Chuỗi dài nhất">
                <CountingNumber number={stats.longestStreak} /> ngày
              </SummaryStat>
            </Reveal>
          </div>
        </>
      )}
    </main>
  );
}

function StreakCard({ streak }) {
  return (
    <div className="h-full bg-night-800 border border-night-700 rounded-xl p-5 flex items-center gap-4">
      {/* Gentle flicker on the streak flame while there is an active streak. */}
      <motion.span
        className="flex-shrink-0"
        animate={streak > 0 ? { scale: [1, 1.08, 1], rotate: [0, -4, 0] } : undefined}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Flame size={40} weight="fill" className="text-orange-500" aria-hidden="true" />
      </motion.span>
      <div>
        <p className="text-xs text-slate-500">Streak hiện tại</p>
        <p className="text-2xl font-bold tabular-nums">
          <CountingNumber number={streak} /> ngày
        </p>
      </div>
    </div>
  );
}

function LevelCard({ level, xpIntoLevel, xpPerLevel }) {
  const pct = Math.round((xpIntoLevel / xpPerLevel) * 100);
  return (
    <div className="h-full bg-night-800 border border-night-700 rounded-xl p-5">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-slate-500">Level hiện tại</p>
        <span className="text-xs text-slate-500">
          {xpIntoLevel}/{xpPerLevel} XP
        </span>
      </div>
      <p className="text-2xl font-bold mb-2 tabular-nums">
        Level <CountingNumber number={level} />
      </p>
      <div
        className="h-2 bg-night-900 rounded-full overflow-hidden"
        role="progressbar"
        aria-label="Tiến độ lên level"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
      >
        {/* scaleX instead of width so the fill animates on the compositor. */}
        <motion.div
          className="h-full w-full bg-gradient-to-r from-coral-500 to-gold origin-left"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: pct / 100 }}
          transition={{ type: 'spring', stiffness: 60, damping: 18, delay: 0.2 }}
        />
      </div>
    </div>
  );
}

function QuickLink({ to, icon: Icon, label }) {
  return (
    <Link
      to={to}
      className="group bg-gradient-to-br from-[var(--c-quicklink-from)] to-[var(--c-quicklink-to)] border border-[var(--c-quicklink-border)] rounded-lg p-4 text-center font-semibold text-[var(--c-quicklink-text)] hover:brightness-110 hover:-translate-y-0.5 active:scale-[0.97] transition-all duration-200 motion-reduce:transform-none"
    >
      <Icon
        size={28}
        weight="duotone"
        className="mx-auto mb-1.5 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6 motion-reduce:transform-none"
        aria-hidden="true"
      />
      {label}
    </Link>
  );
}

function SummaryStat({ label, children }) {
  return (
    <div className="h-full bg-night-800 border border-night-700 rounded-xl p-4 text-center">
      <p className="text-xl font-bold text-coral-400 tabular-nums">{children}</p>
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
            {week.map((day, dIdx) => (
              <motion.div
                key={day.date}
                title={day.date}
                initial={{ opacity: 0, scale: 0.4 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.25 + (wIdx * 7 + dIdx) * 0.004, duration: 0.25 }}
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
