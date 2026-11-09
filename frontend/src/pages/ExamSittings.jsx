import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Accordion } from '@animate-ui/react/primitives/radix-ui/accordion';
import { CaretDown } from '@phosphor-icons/react';
import { listExamYears } from '../api/examSittings';
import PremiumModal from '../components/PremiumModal';
import ProLabel from '../components/ProLabel';
import Reveal from '../components/motion/Reveal';

export default function ExamSittings() {
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openYearId, setOpenYearId] = useState('');

  useEffect(() => {
    listExamYears()
      .then((data) => {
        setYears(data);
        if (data.length > 0) setOpenYearId(data[0].id);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <div className="mb-8">
        <p className="zh text-xl text-coral-400">写作工坊</p>
        <h1 className="text-2xl md:text-3xl font-bold mt-1">Đề thi thật</h1>
        <p className="text-slate-400 mt-1">Đề thi thật theo từng năm, cập nhật dần.</p>
      </div>

      {loading ? (
        <p className="text-slate-500">Đang tải...</p>
      ) : years.length === 0 ? (
        <p className="text-slate-500">Chưa có đề thi thật nào.</p>
      ) : (
        // Animate UI Accordion: panels expand/collapse with a spring height animation.
        <Accordion.Root type="single" collapsible value={openYearId} onValueChange={setOpenYearId} className="space-y-3">
          {years.map((year, i) => (
            <Reveal key={year.id} index={i}>
              <ExamYearItem year={year} />
            </Reveal>
          ))}
        </Accordion.Root>
      )}
    </main>
  );
}

function ExamYearItem({ year }) {
  return (
    <Accordion.Item value={year.id} className="bg-night-800 border border-night-700 rounded-xl overflow-hidden">
      <Accordion.Header>
        <Accordion.Trigger className="group w-full min-h-[44px] flex items-center justify-between px-5 py-4 text-left hover:bg-night-700 transition-colors">
          <span className="font-bold text-lg">Năm {year.year}</span>
          <span className="flex items-center gap-3 text-sm text-slate-400">
            {year.sittings.length} đề
            <CaretDown
              size={16}
              weight="bold"
              aria-hidden="true"
              className="transition-transform duration-300 group-data-[state=open]:rotate-180 motion-reduce:transition-none"
            />
          </span>
        </Accordion.Trigger>
      </Accordion.Header>
      <Accordion.Content>
        <div className="border-t border-night-700 p-4 space-y-2">
          {year.sittings.length === 0 ? (
            <p className="text-sm text-slate-500 px-1">Chưa có đề nào trong năm này.</p>
          ) : (
            year.sittings.map((sitting) => <SittingRow key={sitting.id} sitting={sitting} />)
          )}
        </div>
      </Accordion.Content>
    </Accordion.Item>
  );
}

function SittingRow({ sitting }) {
  const [showPremium, setShowPremium] = useState(false);

  const body = (
    <div className="flex items-center justify-between gap-3 min-h-[44px] px-4 py-3 rounded-lg bg-night-900 border border-night-700 hover:border-coral-500/60 hover:translate-x-1 transition-all duration-200 motion-reduce:transform-none">
      <div className="min-w-0">
        <p className="font-semibold text-sm text-slate-100 truncate">{sitting.label}</p>
        <p className="text-xs text-slate-500 truncate">{sitting.titleVi}</p>
      </div>
      {sitting.isPremium && (
        <span className="flex-shrink-0 bg-gold/90 text-night-950 text-xs font-bold px-2 py-0.5 rounded-full">
          <ProLabel />
        </span>
      )}
    </div>
  );

  if (sitting.locked) {
    return (
      <>
        <button type="button" onClick={() => setShowPremium(true)} className="w-full text-left">
          {body}
        </button>
        <PremiumModal open={showPremium} onClose={() => setShowPremium(false)} />
      </>
    );
  }

  return (
    <Link to={`/exams/${sitting.slug}`} className="block">
      {body}
    </Link>
  );
}
