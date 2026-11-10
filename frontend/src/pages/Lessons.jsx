import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listLessons } from '../api/lessons';
import PremiumModal from '../components/PremiumModal';
import ProLabel from '../components/ProLabel';
import PageHeader from '../components/PageHeader';
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

// Shared card pieces: the whole card is a `.surface` (hover lift lives on a/button),
// with the Chinese title on a soft tinted tile inset at the top.
const CARD = 'surface h-full w-full flex flex-col overflow-hidden text-left';
const TILE = 'relative m-2 mb-0 rounded-2xl bg-night-700/60 flex flex-col items-center justify-center px-3';
const BADGE = 'absolute top-3 text-xs font-bold px-2.5 py-0.5 rounded-full';

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
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <PageHeader kicker="HSK 6 · 写作工坊" title="Bài học" art>
        Sơ đồ phân loại bài viết HSK 6: <span className="zh">议论文</span>, <span className="zh">记叙文</span> và{' '}
        <span className="zh">应用文</span> (3 nhóm).
      </PageHeader>

      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="lesson-crit max-w-lg rounded-2xl border-2 px-5 py-4">
          <p className="text-[11px] font-extrabold tracking-wider lesson-crit-label">
            TIÊU CHÍ PHÂN LOẠI <span className="zh">应用文</span>
          </p>
          <p className="font-bold mt-0.5">Người đọc có quyền quyết định điều bạn cần?</p>
        </div>

        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          aria-pressed={showAll}
          className="self-start sm:self-auto min-h-[44px] rounded-xl border-[1.5px] border-dashed border-coral-400 px-5 text-sm font-semibold text-coral-400 hover:bg-coral-400/10 transition-colors motion-reduce:transition-none"
        >
          {showAll ? 'Ẩn các phần chưa làm' : `Hiện các phần chưa làm (${todoCount})`}
        </button>
      </div>

      {lessons === null ? (
        <p className="text-slate-500 mt-10">Đang tải...</p>
      ) : (
        <>
          {MAP.map((group) => {
            const total = group.subs.reduce((x, s) => x + s[1].length, 0);
            const done = group.subs.reduce((x, s) => x + s[1].filter(isDone).length, 0);
            return (
              <section key={group.title} className="mt-14" aria-label={group.title}>
                <SectionHeading title={group.title} note={`${done}/${total} bài đã xong`} lead={group.desc} />
                {group.subs.map(([label, items]) => {
                  const hasDone = items.some(isDone);
                  if (!hasDone && !showAll) return null;
                  return (
                    <div key={label} className="mt-8">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">
                        {label} <span className="font-normal normal-case tracking-normal">· {items.length}</span>
                      </h3>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
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
            <section className="mt-14" aria-label="议论文 · 记叙文">
              <SectionHeading title={<span className="zh">议论文 · 记叙文</span>} note="Sắp ra mắt" />
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-6">
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

function SectionHeading({ title, note, lead }) {
  return (
    <div className="pb-4 border-b border-night-700">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-2xl md:text-[1.75rem] font-extrabold tracking-tight leading-tight text-slate-100">{title}</h2>
        {note && <span className="text-sm font-semibold text-slate-500 shrink-0">{note}</span>}
      </div>
      {lead && <p className="text-slate-400 mt-1.5">{lead}</p>}
    </div>
  );
}

function CardCta({ locked, label }) {
  return locked ? (
    <span className="inline-flex items-center gap-1 text-gold">
      <Lock size={12} weight="bold" aria-hidden="true" />
      Mở khoá bằng PRO →
    </span>
  ) : (
    <span className="text-coral-400">{label}</span>
  );
}

function MapCard({ zh, zhNote = '', vi, lesson, number, soonLabel = 'Đang soạn' }) {
  const [showPremium, setShowPremium] = useState(false);
  const inner = (
    <>
      <div className={`${TILE} h-36`}>
        {number && <span className={`${BADGE} left-3 bg-night-800 text-coral-400 font-extrabold`}>#{number}</span>}
        {lesson?.isPremium && (
          <span className={`${BADGE} right-3 bg-gold/90 text-night-950`}>
            <ProLabel />
          </span>
        )}
        <span lang="zh" className="zh text-4xl md:text-[2.75rem] leading-tight text-coral-400 text-center">{zh}</span>
        {zhNote && <span lang="zh" className="zh text-base text-coral-400 mt-1">{zhNote}</span>}
      </div>
      <div className="px-5 pt-4 pb-5 flex-1 flex flex-col">
        <p className="font-bold text-slate-100 leading-snug">{vi}</p>
        <p className="mt-auto pt-3 text-sm font-semibold">
          {lesson ? <CardCta locked={lesson.locked} label="Bắt đầu luyện tập →" /> : <span className="text-slate-500">{soonLabel}</span>}
        </p>
      </div>
    </>
  );

  if (!lesson) {
    return (
      <div aria-disabled="true" className={`${CARD} opacity-60`}>
        {inner}
      </div>
    );
  }
  if (lesson.locked) {
    return (
      <>
        <button type="button" onClick={() => setShowPremium(true)} className={CARD}>
          {inner}
        </button>
        <PremiumModal open={showPremium} onClose={() => setShowPremium(false)} />
      </>
    );
  }
  return (
    <Link to={`/lessons/${lesson.slug}`} className={CARD}>
      {inner}
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
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <PageHeader title={pageTitle}>{pageSubtitle}</PageHeader>

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
    <section className="mb-14">
      <SectionHeading title={title} note={subtitle} />
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-6">
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

  const inner = (
    <>
      <div className={`${TILE} h-32`}>
        <span lang="zh" className="zh text-4xl leading-tight text-coral-400 text-center">{lesson.titleZh}</span>
        <span className={`${BADGE} left-3 bg-night-800 text-coral-400 font-extrabold`}>#{index + 1}</span>
        {lesson.isPremium && (
          <span className={`${BADGE} right-3 bg-gold/90 text-night-950`}>
            <ProLabel />
          </span>
        )}
        {lesson.type === 'EXAM' && (
          <span className="absolute bottom-3 right-3 bg-night-800 text-slate-300 text-xs font-semibold px-2.5 py-0.5 rounded-full">
            {lesson.examMonth}/{lesson.examYear}
          </span>
        )}
      </div>
      <div className="px-5 pt-4 pb-5">
        <p className="font-bold text-slate-100 truncate">{lesson.titleVi}</p>
        <p className="text-sm font-semibold mt-2">
          <CardCta locked={lesson.locked} label="Bắt đầu luyện tập →" />
        </p>
      </div>
    </>
  );

  if (lesson.locked) {
    return (
      <>
        <button type="button" onClick={() => setShowPremium(true)} className={CARD}>
          {inner}
        </button>
        <PremiumModal open={showPremium} onClose={() => setShowPremium(false)} />
      </>
    );
  }

  return (
    <Link to={`/lessons/${lesson.slug}`} className={CARD}>
      {inner}
    </Link>
  );
}
