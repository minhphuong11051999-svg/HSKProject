import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listExamYears } from '../api/examSittings';
import PremiumModal from '../components/PremiumModal';
import ProLabel from '../components/ProLabel';

export default function ExamSittings() {
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openYearId, setOpenYearId] = useState(null);

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
        <div className="space-y-3">
          {years.map((year) => (
            <ExamYearAccordion
              key={year.id}
              year={year}
              open={openYearId === year.id}
              onToggle={() => setOpenYearId((prev) => (prev === year.id ? null : year.id))}
            />
          ))}
        </div>
      )}
    </main>
  );
}

function ExamYearAccordion({ year, open, onToggle }) {
  const panelId = `exam-year-panel-${year.id}`;
  const buttonId = `exam-year-button-${year.id}`;

  return (
    <div className="bg-night-800 border border-night-700 rounded-xl overflow-hidden">
      <button
        type="button"
        id={buttonId}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onToggle}
        className="w-full min-h-[44px] flex items-center justify-between px-5 py-4 text-left hover:bg-night-700 transition-colors"
      >
        <span className="font-bold text-lg">Năm {year.year}</span>
        <span className="flex items-center gap-3 text-sm text-slate-400">
          {year.sittings.length} đề
          <span aria-hidden="true" className={`transition-transform ${open ? 'rotate-180' : ''}`}>
            ▾
          </span>
        </span>
      </button>

      {open && (
        <div id={panelId} role="region" aria-labelledby={buttonId} className="border-t border-night-700 p-4 space-y-2">
          {year.sittings.length === 0 ? (
            <p className="text-sm text-slate-500 px-1">Chưa có đề nào trong năm này.</p>
          ) : (
            year.sittings.map((sitting) => <SittingRow key={sitting.id} sitting={sitting} />)
          )}
        </div>
      )}
    </div>
  );
}

function SittingRow({ sitting }) {
  const [showPremium, setShowPremium] = useState(false);

  const body = (
    <div className="flex items-center justify-between gap-3 min-h-[44px] px-4 py-3 rounded-lg bg-night-900 border border-night-700 hover:border-coral-500/60 transition-colors">
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
