import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useInView } from 'motion/react';
import { ArrowRight, MagnifyingGlass, PersonSimpleWalk, PencilLine, Cards, Check, Lock } from '@phosphor-icons/react';
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

const METHODS = [
  {
    zh: '范文倒推',
    vi: 'Đọc ngược bài mẫu',
    icon: MagnifyingGlass,
    text: 'Tách bài mẫu thành khung: mỗi đoạn làm nhiệm vụ gì, câu nào là mẫu câu cố định của thể loại.',
  },
  {
    zh: '生活预演',
    vi: 'Diễn tập tình huống thật',
    icon: PersonSimpleWalk,
    text: 'Đặt mình vào tình huống xin nghỉ, mời, thông báo, rồi chọn từ văn viết thay cho khẩu ngữ.',
  },
  {
    zh: '写改升',
    vi: 'Viết, sửa, nâng cấp',
    icon: PencilLine,
    text: 'Tìm lỗi sai trong bài viết mẫu, xem bản sửa, rồi tự viết bài của mình trên tờ giấy mô phỏng.',
  },
];

const GENRES = [
  { zh: '通知', vi: 'Thông báo' },
  { zh: '启事', vi: 'Bố cáo, tìm đồ, rao bán' },
  { zh: '推荐信', vi: 'Thư giới thiệu' },
  { zh: '邀请信', vi: 'Thư mời' },
  { zh: '请假条', vi: 'Đơn xin nghỉ ốm' },
  { zh: '请假条', vi: 'Đơn xin nghỉ việc riêng' },
  { zh: '申请书', vi: 'Đơn xin' },
];

const STEPS = [
  'Duyệt lý thuyết',
  'Bài mẫu',
  'Nhận diện thể thức',
  'Đục lỗ',
  'Tìm lỗi sai',
  'Ghép từ vựng & viết câu',
  'Luyện viết hoàn chỉnh',
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
      <StepsSection />
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
              Luyện viết văn ứng dụng HSK6 cho người Việt
            </h1>
          </Reveal>
          <Reveal index={2}>
            <p className="l-lead">
              7 dạng văn bản ứng dụng, luyện viết trên tờ giấy mô phỏng đúng thể thức thi. Bài trắc nghiệm, điền từ và ghép từ được chấm ngay.
            </p>
          </Reveal>
          <Reveal index={3}>
            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <PrimaryButton />
              <a href="#dang-bai" className="l-btn l-btn-ghost">
                Xem 7 dạng bài
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
        <SectionHead id="method-title" zh="范文不是用来背的" title="Bài mẫu không phải để học thuộc">
          Ba cách luyện giúp bạn hiểu vì sao bài mẫu được viết như vậy, rồi tự viết được bài của mình.
        </SectionHead>
        <ol className="grid md:grid-cols-3 gap-5 mt-10">
          {METHODS.map((m, i) => (
            <li key={m.zh} className="l-card">
              <div className="flex items-center justify-between">
                <span className="l-icon">
                  <m.icon size={26} weight="duotone" aria-hidden="true" />
                </span>
                <span className="l-num">0{i + 1}</span>
              </div>
              <p className="zh text-2xl mt-6 text-[var(--l-ink)]">{m.zh}</p>
              <h3 className="l-h3 mt-1">{m.vi}</h3>
              <p className="l-body mt-3">{m.text}</p>
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
        <SectionHead id="genre-title" title="7 dạng văn bản trong đề thi viết HSK6">
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
          <li className="l-card l-genre l-genre-note">
            <Cards size={30} weight="duotone" aria-hidden="true" className="text-[var(--l-blue)]" />
            <span className="l-h3 mt-3">Flashcard từ vựng</span>
            <span className="l-body mt-1">Mỗi chủ đề có thẻ từ, phát âm tự động và 4 dạng bài tập.</span>
          </li>
        </ul>
      </div>
    </section>
  );
}

function StepsSection() {
  return (
    <section className="l-section l-section-tint" aria-labelledby="steps-title">
      <div className="l-wrap">
        <SectionHead id="steps-title" title="7 bước trong mỗi bài học">
          Bước 1 đến 3 học miễn phí. Tài khoản PRO mở bước 4 đến 7 và các đề thi thật có nhãn PRO.
        </SectionHead>
        <ol className="l-steps mt-10">
          {STEPS.map((s, i) => (
            <li key={s} className="l-step">
              <span className={`l-step-num ${i < 3 ? 'is-free' : ''}`}>{i + 1}</span>
              <span className="l-step-label">{s}</span>
              <span className={`l-step-tag ${i < 3 ? '' : 'is-pro'}`}>
                {i >= 3 && <Lock size={12} weight="bold" aria-hidden="true" />}
                {i < 3 ? 'Miễn phí' : 'PRO'}
              </span>
            </li>
          ))}
        </ol>
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
