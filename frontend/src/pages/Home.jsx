import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useInView } from 'motion/react';
import { ArrowRight, BookOpenText, Flame, Brain, Exam, Check } from '@phosphor-icons/react';
import { useAuth } from '../context/AuthContext';
import Dashboard from './Dashboard';
import Reveal from '../components/motion/Reveal';
import LetterPaper from '../components/LetterPaper';

export default function Home() {
  const { user } = useAuth();
  return user ? <Dashboard /> : <Landing />;
}

/*
 * Landing page for visitors, rebuilt with the Taste Skill rules:
 * the hero alone on the first screen (category + buyer in the h1, one hard fact,
 * at most two actions), one idea per section, equal left/right edges, no captions
 * under pictures, the product's own UI (the simulated exam paper) shown live,
 * one hero entrance + one dealt moment (the paper writing itself), hover lift/press.
 * Palette: blue-and-white porcelain taken from the brand artwork in the hero.
 */

const PRIMARY = 'Tạo tài khoản miễn phí';

// Quy tắc 4S: the four things every lesson is built to do.
const METHODS = [
  {
    zh: '学',
    vi: 'Truyền đạt kiến thức',
    icon: BookOpenText,
    text: 'Giúp bạn nắm vững cách viết chi tiết cho từng dạng bài.',
    nudge: 'Hiểu rồi chứ?',
  },
  {
    zh: '燃',
    vi: 'Tạo động lực, nhắc bạn quay lại',
    icon: Flame,
    text: 'Giao diện bắt mắt, các cuộc đua và bảng xếp hạng, cùng lời nhắc học đều đặn để bạn giữ nhịp luyện viết.',
    nudge: 'Hôm nay bạn đã luyện chưa?',
  },
  {
    zh: '记',
    vi: 'Ghi nhớ',
    icon: Brain,
    text: 'Củng cố qua các nội dung bài học và luyện tập phong phú.',
    nudge: 'Làm thêm một bài nữa.',
  },
  {
    zh: '用',
    vi: 'Dùng được khi đi thi',
    icon: Exam,
    text: 'Mục tiêu cuối cùng: giúp bạn tự tin ứng phó với đề viết HSK6 (3.0).',
    nudge: 'Sẵn sàng thi chưa?',
  },
];

const GENRES = [
  { zh: '通知', vi: 'Thông báo' },
  { zh: '启事', vi: 'Bố cáo, tìm đồ, rao bán' },
  { zh: '推荐信', vi: 'Thư giới thiệu' },
  { zh: '邀请信', vi: 'Thư mời' },
];

const PAPER_RULES = [
  'Tiêu đề căn giữa, tên hai chữ tự cách ra',
  'Xưng hô sát lề trái, có dấu hai chấm',
  'Mỗi đoạn chính văn thụt đầu dòng 2 ô',
  '此致 lùi 4 ô, 敬礼！sát lề trái',
  'Ký tên và ngày tháng ở góc phải',
  'Tự đếm số chữ Hán của bài',
];

const SAMPLE = {
  title: '请假条',
  greeting: '王老师：',
  paragraphs: [
    '我因昨晚不慎着凉，今天发烧、咳嗽不止，医生建议我卧床静养。',
    '我拟于10月15日请假一天，特向您请假，并望批准。',
  ],
  closing1: '此致',
  closing2: '敬礼！',
  sign: '明芳',
  date: '2026年10月14日',
};

function Landing() {
  return (
    <div className="landing">
      <Hero />
      <MethodSection />
      <PaperSection />
      <GenreSection />
      <CloseSection />
    </div>
  );
}

function PrimaryButton({ className = '' }) {
  return (
    <Link to="/register" className={`l-btn l-btn-primary group ${className}`}>
      {PRIMARY}
      <ArrowRight size={18} weight="bold" aria-hidden="true" className="transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" />
    </Link>
  );
}

function Hero() {
  return (
    <section className="l-hero" aria-labelledby="hero-title">
      {/* Blurred, faint copy of the brand artwork as the hero's background. */}
      <div className="l-hero-bg" aria-hidden="true" />

      <div className="l-wrap l-hero-inner">
        <div className="l-hero-text">
          <Reveal index={0}>
            <p className="l-kicker">
              <span className="zh">写作工坊</span> · HSK6
            </p>
          </Reveal>
          <Reveal index={1}>
            <h1 id="hero-title" className="l-h1">
              Belle Chinese Lab - HSK6 (3.0)
            </h1>
          </Reveal>
          <Reveal index={2}>
            <p className="l-lead zh" lang="zh">
              降低认知门槛，人人皆可抵达
            </p>
          </Reveal>
          <Reveal index={3}>
            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <PrimaryButton />
              <a href="#dang-bai" className="l-btn l-btn-ghost">
                Xem các dạng bài có sẵn
              </a>
            </div>
          </Reveal>
        </div>
        {/* The artwork carries its own lettering, so it is shown whole, never cropped. */}
        <Reveal index={2} className="l-hero-art">
          <picture>
            <source media="(max-width: 767px)" srcSet="/img/home-hero-800.webp" />
            <img
              src="/img/home-hero.webp"
              alt="Bài mẫu không phải để học thuộc: đọc ngược bài mẫu, diễn tập tình huống thật, viết, sửa và nâng cấp"
              width="1280"
              height="816"
              fetchPriority="high"
            />
          </picture>
        </Reveal>
      </div>
    </section>
  );
}

function SectionHead({ id, zh, title, children }) {
  return (
    <div className="max-w-2xl">
      {zh && <p className="zh l-kicker">{zh}</p>}
      <h2 id={id} className="l-h2">{title}</h2>
      {children && <p className="l-body mt-3">{children}</p>}
    </div>
  );
}

function MethodSection() {
  return (
    <section className="l-section" aria-labelledby="method-title">
      <div className="l-wrap">
        <div className="max-w-2xl">
          <p className="zh l-kicker">四步学习法</p>
          <h2 id="method-title" className="l-h2">Mindset Belle Chinese Lab</h2>
          <ul className="l-body mt-3 flex flex-wrap gap-x-6 gap-y-1">
            <li>Đảm bảo <span className="zh text-[var(--l-ink)]">学</span></li>
            <li>Củng cố <span className="zh text-[var(--l-ink)]">燃</span></li>
            <li>Hướng đến <span className="zh text-[var(--l-ink)]">记</span></li>
          </ul>
        </div>
        <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-10">
          {METHODS.map((m, i) => (
            <li key={m.zh} className="l-card flex flex-col">
              <div className="flex items-center justify-between">
                <span className="l-icon">
                  <m.icon size={26} weight="duotone" aria-hidden="true" />
                </span>
                <span className="l-num">0{i + 1}</span>
              </div>
              <p className="zh text-3xl mt-6 text-[var(--l-ink)]" lang="zh">{m.zh}</p>
              <h3 className="l-h3 mt-1">{m.vi}</h3>
              <p className="l-body mt-3">{m.text}</p>
              <p className="l-nudge mt-auto pt-4">{m.nudge}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

// The page's one dealt moment: the sample letter writes itself, slot by slot,
// the first time the paper scrolls into view (instant under reduced motion).
function PaperSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -10% 0px' });
  const [shown, setShown] = useState(0);
  const total = 7;

  useEffect(() => {
    if (!inView) return undefined;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setShown(total);
      return undefined;
    }
    const timer = setInterval(() => setShown((n) => (n >= total ? n : n + 1)), 220);
    return () => clearInterval(timer);
  }, [inView]);

  const p = SAMPLE;
  return (
    <section className="l-section l-section-tint" aria-labelledby="paper-title">
      <div className="l-wrap grid lg:grid-cols-[1fr_1.1fr] gap-10 lg:gap-16 items-center">
        <div>
          <SectionHead id="paper-title" title="Tờ giấy mô phỏng đúng thể thức thi">
            Gõ vào từng ô, bài viết tự xếp lên tờ giấy theo quy cách văn bản ứng dụng.
          </SectionHead>
          <ul className="mt-8 grid sm:grid-cols-2 lg:grid-cols-1 gap-3">
            {PAPER_RULES.map((r) => (
              <li key={r} className="flex items-start gap-3 l-body">
                <span className="l-check">
                  <Check size={14} weight="bold" aria-hidden="true" />
                </span>
                {r}
              </li>
            ))}
          </ul>
        </div>
        <div ref={ref} className="l-paper-frame">
          <LetterPaper
            title={shown > 0 ? p.title : ''}
            greeting={shown > 1 ? p.greeting : ''}
            paragraphs={p.paragraphs.slice(0, Math.max(0, Math.min(2, shown - 2)))}
            closing1={shown > 4 ? p.closing1 : ''}
            closing2={shown > 5 ? p.closing2 : ''}
            sign={shown > 6 ? p.sign : ''}
            date={shown > 6 ? p.date : ''}
            minHeight="min-h-[25rem]"
          />
        </div>
      </div>
    </section>
  );
}

function GenreSection() {
  return (
    <section id="dang-bai" className="l-section" aria-labelledby="genre-title">
      <div className="l-wrap">
        <SectionHead id="genre-title" title="Một số dạng bài trong đề thi viết HSK6">
          Mỗi dạng là một bài học riêng, đi từ bài mẫu đến bài viết hoàn chỉnh của bạn.
        </SectionHead>
        <ul className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
          {GENRES.map((g, i) => (
            <li key={`${g.zh}-${i}`}>
              <Link to="/register" className="l-card l-genre group">
                <span className="zh l-genre-zh">{g.zh}</span>
                <span className="l-h3 mt-3">{g.vi}</span>
                <span className="l-link mt-auto pt-4">
                  Học bài này
                  <ArrowRight size={16} weight="bold" aria-hidden="true" className="transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function CloseSection() {
  return (
    <section className="l-close" aria-labelledby="close-title">
      <div className="l-wrap text-center">
        <p className="zh l-close-zh" aria-hidden="true">
          通知
        </p>
        <h2 id="close-title" className="l-h2 mt-8">
          Bắt đầu với bài Thông báo ngay hôm nay
        </h2>
        <p className="l-body mt-3">Đăng ký bằng email, không cần thẻ thanh toán.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
          <PrimaryButton />
          <Link to="/login" className="l-btn l-btn-ghost">
            Đăng nhập
          </Link>
        </div>
        <p className="mt-16 text-xs text-[var(--l-muted)]">© {new Date().getFullYear()} Belle Chinese Lab</p>
      </div>
    </section>
  );
}
