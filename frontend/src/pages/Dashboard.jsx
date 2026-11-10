import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyStats } from '../api/lessons';
import { motion } from 'motion/react';
import { CountingNumber } from '@animate-ui/react/primitives/texts/counting-number';
import Reveal from '../components/motion/Reveal';
import PageHeader from '../components/PageHeader';
import { BookOpen, NotePencil, Target, ClockCounterClockwise, Flame, ArrowRight } from '@phosphor-icons/react';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getMyStats().then(setStats).catch(() => setStats(null));
  }, []);

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-10">
      <PageHeader
        kicker="写作工坊 · HSK6"
        title={<>Xin chào, {user.name}</>}
        art
        actions={
          <Link
            to="/lessons"
            className="inline-flex items-center justify-center gap-2 min-h-[48px] px-6 rounded-xl bg-coral-500 hover:bg-coral-600 text-white font-bold shadow-lg shadow-coral-500/25 transition-colors"
          >
            Tiếp tục luyện viết
            <ArrowRight size={18} weight="bold" aria-hidden="true" />
          </Link>
        }
      >
        Giữ vững chuỗi học và tiếp tục luyện viết mỗi ngày.
      </PageHeader>

      {stats && (
        <>
          <div className="grid sm:grid-cols-2 gap-5 mb-5">
            <Reveal index={0}>
              <StreakCard streak={stats.currentStreak} />
            </Reveal>
            <Reveal index={1}>
              <LevelCard level={stats.level} xpIntoLevel={stats.xpIntoLevel} xpPerLevel={stats.xpPerLevel} />
            </Reveal>
          </div>

          <Reveal index={2}>
            <section className="surface p-6 mb-5" aria-labelledby="quick-title">
              <p className="kicker zh" lang="zh">开始练习</p>
              <h2 id="quick-title" className="text-xl font-extrabold tracking-tight mt-1 mb-5">Bắt đầu luyện tập</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <QuickLink to="/lessons" icon={BookOpen} label="Bài học" />
                <QuickLink to="/practice" icon={NotePencil} label="Đề mẫu" />
                <QuickLink to="/lessons/exam" icon={Target} label="Đề thi thật" />
                <QuickLink to="/history" icon={ClockCounterClockwise} label="Lịch sử làm bài" />
              </div>
            </section>
          </Reveal>

          <Reveal index={3}>
            <ActivityHeatmap activity={stats.activity} />
          </Reveal>

          <div className="grid grid-cols-3 gap-3 sm:gap-5 mt-5">
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
    <div className="h-full surface p-6 flex items-center gap-5">
      {/* Gentle flicker on the streak flame while there is an active streak. */}
      <motion.span
        className="flex-shrink-0"
        animate={streak > 0 ? { scale: [1, 1.08, 1], rotate: [0, -4, 0] } : undefined}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
      >
        <span className="flex w-14 h-14 items-center justify-center rounded-full bg-orange-500/15">
          <Flame size={32} weight="fill" className="text-orange-500" aria-hidden="true" />
        </span>
      </motion.span>
      <div>
        <p className="text-sm font-semibold text-slate-400">Streak hiện tại</p>
        <p className="text-3xl font-extrabold tracking-tight tabular-nums">
          <CountingNumber number={streak} /> ngày
        </p>
      </div>
    </div>
  );
}

function LevelCard({ level, xpIntoLevel, xpPerLevel }) {
  const pct = Math.round((xpIntoLevel / xpPerLevel) * 100);
  return (
    <div className="h-full surface p-6">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-semibold text-slate-400">Level hiện tại</p>
        <span className="text-sm text-slate-400 tabular-nums">
          {xpIntoLevel}/{xpPerLevel} XP
        </span>
      </div>
      <p className="text-3xl font-extrabold tracking-tight mb-3 tabular-nums">
        Level <CountingNumber number={level} />
      </p>
      <div
        className="h-2.5 bg-night-700 rounded-full overflow-hidden"
        role="progressbar"
        aria-label="Tiến độ lên level"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
      >
        {/* scaleX instead of width so the fill animates on the compositor. */}
        <motion.div
          className="h-full w-full bg-gradient-to-r from-coral-500 to-coral-300 origin-left"
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
      className="group bg-gradient-to-br from-[var(--c-quicklink-from)] to-[var(--c-quicklink-to)] border border-[var(--c-quicklink-border)] rounded-2xl p-5 text-center font-bold text-[var(--c-quicklink-text)] hover:border-coral-400 hover:-translate-y-0.5 active:scale-[0.97] transition-all duration-200 motion-reduce:transform-none"
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
    <div className="h-full surface p-5 text-center">
      <p className="text-2xl font-extrabold tracking-tight text-coral-400 tabular-nums">{children}</p>
      <p className="text-sm text-slate-400 mt-1">{label}</p>
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
    <section className="surface p-6" aria-labelledby="heat-title">
      <h2 id="heat-title" className="text-xl font-extrabold tracking-tight mb-1">90 ngày gần nhất</h2>
      <p className="text-sm text-slate-400 mb-5">Mỗi ô là một ngày. Ô sáng màu = có làm bài hôm đó.</p>
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
                className={`w-3.5 h-3.5 rounded-[4px] ${day.active ? 'bg-coral-400' : 'bg-night-700'}`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-3 text-xs text-slate-500">
        <span>Ít</span>
        <span className="w-3 h-3 rounded-sm bg-night-700 inline-block" />
        <span className="w-3 h-3 rounded-sm bg-coral-400 inline-block" />
        <span>Nhiều</span>
      </div>
    </section>
  );
}
