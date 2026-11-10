import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listLessons } from '../api/lessons';
import PremiumModal from '../components/PremiumModal';
import ProLabel from '../components/ProLabel';
import Reveal from '../components/motion/Reveal';
import { Lock } from '@phosphor-icons/react';

const TITLES = {
  practice: { heading: 'Bài luyện tập', subtitle: 'Luyện tập với 7 bài học, cập nhật thêm theo thời gian.' },
  exam: { heading: 'Đề thi thật', subtitle: 'Đề thi thật theo tháng, cập nhật dần.' },
};

// Classification map of HSK6 writing (from belle_hsk6_map.html). Each entry is
// [titleZh, sub-label, Vietnamese name, lesson slug or null when not written yet].
const MAP = [
  {
    title: 'Loại I · Có',
    desc: 'Thỉnh cầu (xin, đề nghị)',
    subs: [
      ['1.1 Cho bản thân', [
        ['请假条', '', 'Đơn xin nghỉ phép', 'luyen-viet-qingjiatiao'],
        ['请假条', '（事假/事务）', 'Đơn xin nghỉ phép (việc riêng / công việc)', 'luyen-viet-qingjiatiao-shijia'],
        ['申请书', '', 'Đơn xin', 'luyen-viet-shenqingshu'],
        ['求职信', '', 'Thư xin việc', null],
      ]],
      ['1.2 Cho người khác', [['推荐信', '', 'Thư giới thiệu', 'luyen-viet-tuijianxin']]],
      ['1.3 Cho tổ chức', [['建议信', '', 'Thư đề xuất', null]]],
    ],
  },
  {
    title: 'Loại II · Không',
    desc: 'Người đọc không quyết định điều bạn cần',
    subs: [
      ['Loại 1 · Báo cho biết', [
        ['启事', '', 'Bố cáo / Rao vặt', 'luyen-viet-qishi'],
        ['通知', '', 'Thông báo', 'luyen-viet-thongbao'],
        ['通告', '', 'Thông cáo', null],
        ['声明', '', 'Tuyên bố', null],
      ]],
      ['Loại 2 · Kết nối tình cảm', [
        ['感谢信', '', 'Thư cảm ơn', null],
        ['贺信', '', 'Thư chúc mừng', null],
        ['邀请信', '', 'Thư mời', 'luyen-viet-yaoqingxin'],
        ['致辞', '', 'Diễn văn', null],
      ]],
    ],
  },
];

const COMING = [
  ['议论文', 'Văn nghị luận'],
  ['记叙文', 'Văn kể chuyện'],
];

export default function Lessons({ type }) {
  return type ? <LessonList type={type} /> : <LessonMap />;
}

function LessonMap() {
  const [lessons, setLessons] = useState(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    listLessons('practice')
      .then(setLessons)
      .catch(() => setLessons([]));
  }, []);

  const bySlug = new Map((lessons || []).map((l) => [l.slug, l]));
  const isDone = (item) => item[3] && bySlug.has(item[3]);
  const allItems = MAP.flatMap((g) => g.subs.flatMap((s) => s[1]));
  const todoCount = allItems.filter((it) => !isDone(it)).length + COMING.length;
  let n = 0;

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <div className="mb-6">
        <p className="zh text-xl text-coral-400">HSK 6 · 写作工坊</p>
        <h1 className="text-2xl md:text-3xl font-bold mt-1">Bài học</h1>
        <p className="text-slate-400 mt-1">
          Sơ đồ phân loại bài viết HSK 6: <span className="zh">议论文</span>, <span className="zh">记叙文</span> và{' '}
          <span className="zh">应用文</span> (3 nhóm).
        </p>
      </div>

      <div className="lesson-crit max-w-lg rounded-2xl border-2 px-5 py-3">
        <p className="text-[11px] font-extrabold tracking-wider lesson-crit-label">
          TIÊU CHÍ PHÂN LOẠI <span className="zh">应用文</span>
        </p>
        <p className="font-bold">Người đọc có quyền quyết định điều bạn cần?</p>
      </div>

      <button
        type="button"
        onClick={() => setShowAll((v) => !v)}
        aria-pressed={showAll}
        className="mt-4 min-h-[44px] rounded-xl border-[1.5px] border-dashed border-coral-400 px-4 text-sm font-semibold text-coral-400 hover:bg-coral-400/10 transition-colors"
      >
        {showAll ? 'Ẩn các phần chưa làm' : `Hiện các phần chưa làm (${todoCount})`}
      </button>

      {lessons === null ? (
        <p className="text-slate-500 mt-8">Đang tải...</p>
      ) : (
        <>
          {MAP.map((group) => {
            const total = group.subs.reduce((x, s) => x + s[1].length, 0);
            const done = group.subs.reduce((x, s) => x + s[1].filter(isDone).length, 0);
            return (
              <section key={group.title} className="mt-10" aria-label={group.title}>
                <MapHeading title={group.title} note={`${done}/${total} bài đã xong`} />
                <p className="text-slate-400 font-semibold mt-1">{group.desc}</p>
                {group.subs.map(([label, items]) => {
                  const hasDone = items.some(isDone);
                  if (!hasDone && !showAll) return null;
                  return (
                    <div key={label} className="mt-6">
                      <h3 className="text-base font-bold text-slate-400 mb-3">
                        {label} <span className="font-normal text-sm">· {items.length}</span>
                      </h3>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {items.map((it) => {
                          const lesson = isDone(it) ? bySlug.get(it[3]) : null;
                          if (!lesson && !showAll) return null;
                          if (lesson) n += 1;
                          return (
                            <MapCard key={it[0] + it[1]} zh={it[0]} zhNote={it[1]} vi={it[2]} lesson={lesson} number={lesson ? n : null} />
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </section>
            );
          })}

          {showAll && (
            <section className="mt-10" aria-label="议论文 · 记叙文">
              <MapHeading title={<span className="zh">议论文 · 记叙文</span>} note="Sắp ra mắt" />
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                {COMING.map(([zh, vi]) => (
                  <MapCard key={zh} zh={zh} vi={vi} lesson={null} soonLabel="Sắp ra mắt" />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </main>
  );
}

function MapHeading({ title, note }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-xl md:text-2xl font-bold border-l-4 border-coral-400 pl-3">{title}</h2>
      <span className="text-sm text-slate-500 shrink-0">{note}</span>
    </div>
  );
}

function MapCard({ zh, zhNote = '', vi, lesson, number, soonLabel = 'Đang soạn' }) {
  const [showPremium, setShowPremium] = useState(false);
  const body = (
    <div
      className={`group h-full flex flex-col bg-night-800 border border-night-700 rounded-2xl overflow-hidden text-left transition-all duration-200 ${
        lesson ? 'hover:border-coral-400 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20 motion-reduce:transform-none' : 'opacity-60'
      }`}
    >
      <div className="relative h-36 bg-night-700 flex flex-col items-center justify-center px-3">
        {number && (
          <span className="absolute top-2.5 left-2.5 bg-night-800 text-coral-400 text-xs font-extrabold px-2.5 py-0.5 rounded-full">
            #{number}
          </span>
        )}
        {lesson?.isPremium && (
          <span className="absolute top-2.5 right-2.5 bg-gold/90 text-night-950 text-xs font-bold px-2 py-0.5 rounded-full">
            <ProLabel />
          </span>
        )}
        <span lang="zh" className="zh text-4xl md:text-[2.75rem] leading-tight text-coral-400 text-center">{zh}</span>
        {zhNote && <span lang="zh" className="zh text-base text-coral-400 mt-1">{zhNote}</span>}
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <p className="font-semibold text-slate-100 leading-snug">{vi}</p>
        <p className={`mt-auto pt-3 text-sm ${lesson ? (lesson.locked ? 'text-gold' : 'text-coral-400') : 'text-slate-500'}`}>
          {!lesson ? (
            soonLabel
          ) : lesson.locked ? (
            <span className="inline-flex items-center gap-1">
              <Lock size={12} weight="bold" aria-hidden="true" />
              Mở khoá bằng PRO →
            </span>
          ) : (
            'Bắt đầu luyện tập →'
          )}
        </p>
      </div>
    </div>
  );

  if (!lesson) return <div aria-disabled="true">{body}</div>;
  if (lesson.locked) {
    return (
      <>
        <button type="button" onClick={() => setShowPremium(true)} className="block w-full h-full text-left">
          {body}
        </button>
        <PremiumModal open={showPremium} onClose={() => setShowPremium(false)} />
      </>
    );
  }
  return (
    <Link to={`/lessons/${lesson.slug}`} className="block h-full rounded-2xl">
      {body}
    </Link>
  );
}

function LessonList({ type }) {
  const [practice, setPractice] = useState([]);
  const [exam, setExam] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      type === 'exam' ? Promise.resolve([]) : listLessons('practice'),
      type === 'practice' ? Promise.resolve([]) : listLessons('exam'),
    ])
      .then(([p, e]) => {
        setPractice(p);
        setExam(e);
      })
      .finally(() => setLoading(false));
  }, [type]);

  const pageTitle = type ? TITLES[type]?.heading : 'Bài học';
  const pageSubtitle = type ? TITLES[type]?.subtitle : 'Toàn bộ bài luyện viết và đề thi thật.';

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <div className="mb-8">
        <p className="zh text-xl text-coral-500">写作工坊</p>
        <h1 className="text-2xl md:text-3xl font-bold mt-1">{pageTitle}</h1>
        <p className="text-slate-400 mt-1">{pageSubtitle}</p>
      </div>

      {loading ? (
        <p className="text-slate-500">Đang tải...</p>
      ) : (
        <>
          <LessonSection title="Bài luyện tập" subtitle={`${practice.length} bài học`} lessons={practice} />
          <LessonSection title="Đề thi thật" subtitle={`${exam.length} bài học`} lessons={exam} />
          {practice.length === 0 && exam.length === 0 && (
            <p className="text-slate-500">Chưa có bài học nào trong mục này.</p>
          )}
        </>
      )}
    </main>
  );
}

function LessonSection({ title, subtitle, lessons }) {
  if (lessons.length === 0) return null;

  return (
    <section className="mb-10">
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <span className="w-1 h-5 bg-coral-500 rounded-full inline-block" />
          {title}
        </h2>
        <span className="text-xs text-slate-500">{subtitle}</span>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {lessons.map((lesson, idx) => (
          <Reveal key={lesson.slug} index={idx} className="h-full">
              <LessonCard lesson={lesson} index={idx} />
            </Reveal>
        ))}
      </div>
    </section>
  );
}

function LessonCard({ lesson, index }) {
  const [showPremium, setShowPremium] = useState(false);

  const body = (
    <div className="group h-full bg-night-800 border border-night-700 rounded-xl overflow-hidden transition-all duration-300 hover:border-coral-500/60 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20 motion-reduce:transform-none">
      <div className="relative bg-gradient-to-br from-night-700 to-night-800 h-28 flex items-center justify-center">
        <span className="zh text-4xl text-coral-500/90 transition-transform duration-300 group-hover:scale-110 motion-reduce:transform-none">{lesson.titleZh}</span>
        <span className="absolute top-2 left-2 bg-night-900/80 text-coral-400 text-xs font-bold px-2 py-0.5 rounded-full">
          #{index + 1}
        </span>
        {lesson.isPremium && (
          <span className="absolute top-2 right-2 bg-gold/90 text-night-950 text-xs font-bold px-2 py-0.5 rounded-full">
            <ProLabel />
          </span>
        )}
        {lesson.type === 'EXAM' && (
          <span className="absolute bottom-2 right-2 bg-night-900/80 text-slate-300 text-xs px-2 py-0.5 rounded-full">
            {lesson.examMonth}/{lesson.examYear}
          </span>
        )}
      </div>
      <div className="p-4">
        <p className="font-semibold text-sm text-slate-100 truncate">{lesson.titleVi}</p>
        {lesson.locked ? (
          <p className="text-xs text-gold mt-2"><span className="inline-flex items-center gap-1"><Lock size={12} weight="bold" aria-hidden="true" />Mở khoá bằng PRO →</span></p>
        ) : (
          <p className="text-xs text-coral-400 mt-2">Bắt đầu luyện tập →</p>
        )}
      </div>
    </div>
  );

  if (lesson.locked) {
    return (
      <>
        <button type="button" onClick={() => setShowPremium(true)} className="text-left w-full h-full">
          {body}
        </button>
        <PremiumModal open={showPremium} onClose={() => setShowPremium(false)} />
      </>
    );
  }

  return <Link to={`/lessons/${lesson.slug}`} className="block h-full">{body}</Link>;
}
