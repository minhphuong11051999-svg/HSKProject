import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Accordion } from '@animate-ui/react/primitives/radix-ui/accordion';
import { CaretDown } from '@phosphor-icons/react';
import { listExamYears } from '../api/examSittings';
import PremiumModal from '../components/PremiumModal';
import ProLabel from '../components/ProLabel';
import PageHeader from '../components/PageHeader';
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
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <PageHeader title="Đề thi thật">Đề thi thật theo từng năm, cập nhật dần.</PageHeader>

      {loading ? (
        <p className="text-slate-500">Đang tải...</p>
      ) : years.length === 0 ? (
        <p className="text-slate-500">Chưa có đề thi thật nào.</p>
      ) : (
        // Animate UI Accordion: panels expand/collapse with a spring height animation.
        <Accordion.Root type="single" collapsible value={openYearId} onValueChange={setOpenYearId} className="space-y-4">
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
    <Accordion.Item value={year.id} className="surface overflow-hidden">
      <Accordion.Header>
        <Accordion.Trigger className="group w-full min-h-[44px] flex items-center justify-between gap-4 px-6 py-5 text-left hover:bg-night-700/40 transition-colors motion-reduce:transition-none">
          <span className="text-xl font-extrabold tracking-tight text-slate-100">Năm {year.year}</span>
          <span className="flex items-center gap-3 text-sm font-semibold text-slate-400">
            {year.sittings.length} đề
            <span className="grid place-items-center w-8 h-8 rounded-full bg-night-700/60 text-coral-400">
              <CaretDown
                size={16}
                weight="bold"
                aria-hidden="true"
                className="transition-transform duration-300 group-data-[state=open]:rotate-180 motion-reduce:transition-none"
              />
            </span>
          </span>
        </Accordion.Trigger>
      </Accordion.Header>
      <Accordion.Content>
        <div className="border-t border-night-700 p-4 sm:p-5 space-y-3">
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
    <div className="flex items-center gap-4 min-h-[44px] p-3 pr-4 rounded-2xl bg-night-700/30 border border-night-700 hover:border-coral-400/60 hover:bg-night-800 hover:-translate-y-0.5 transition-all duration-200 motion-reduce:transform-none motion-reduce:transition-none">
      {sitting.titleZh && (
        <span
          lang="zh"
          aria-hidden="true"
          className="zh hidden sm:flex items-center justify-center flex-shrink-0 min-w-[3.5rem] max-w-[9rem] h-14 px-3 rounded-xl bg-night-700/60 text-coral-400 text-lg whitespace-nowrap overflow-hidden"
        >
          {sitting.titleZh}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="font-bold text-slate-100 truncate">{sitting.label}</p>
        <p className="text-sm text-slate-500 truncate">{sitting.titleVi}</p>
      </div>
      {sitting.isPremium && (
        <span className="flex-shrink-0 bg-gold/90 text-night-950 text-xs font-bold px-2.5 py-0.5 rounded-full">
          <ProLabel />
        </span>
      )}
    </div>
  );

  if (sitting.locked) {
    return (
      <>
        <button type="button" onClick={() => setShowPremium(true)} className="block w-full text-left rounded-2xl">
          {body}
        </button>
        <PremiumModal open={showPremium} onClose={() => setShowPremium(false)} />
      </>
    );
  }

  return (
    <Link to={`/exams/${sitting.slug}`} className="block rounded-2xl">
      {body}
    </Link>
  );
}
