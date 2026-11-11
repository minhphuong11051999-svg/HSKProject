import { useEffect, useState } from 'react';
import { getSettings, updateSettings } from '../../api/settings';
import { PANEL, PANEL_TITLE, HINT, INPUT, BTN_PRIMARY, BTN_SECONDARY } from './ui';
import { Trash, CaretDown } from '@phosphor-icons/react';

// Site-wide paper settings shared by Đề mẫu and Đề thi thật:
// - open the "Từ vựng và luận điểm" tab for everyone (hidden at launch);
// - the AI grading scale (criteria + max points), editable without code.
export default function PaperSettingsPanel() {
  const [showOutlineTab, setShowOutlineTab] = useState(false);
  const [criteria, setCriteria] = useState([]);
  const [savingSwitch, setSavingSwitch] = useState(false);
  const [savingRubric, setSavingRubric] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    getSettings()
      .then((st) => {
        setShowOutlineTab(!!st.showOutlineTab);
        setCriteria(st.aiRubric?.criteria || []);
      })
      .catch(() => {});
  }, []);

  async function toggleOutline() {
    setSavingSwitch(true);
    try {
      const st = await updateSettings({ showOutlineTab: !showOutlineTab });
      setShowOutlineTab(!!st.showOutlineTab);
    } finally {
      setSavingSwitch(false);
    }
  }

  const setRow = (i, key, value) => setCriteria((rows) => rows.map((r, j) => (j === i ? { ...r, [key]: value } : r)));
  const total = criteria.reduce((s, c) => s + (Number(c.max) || 0), 0);

  async function saveRubric() {
    setSavingRubric(true);
    setMsg('');
    try {
      const clean = criteria.filter((c) => c.name.trim() && Number(c.max) > 0).map((c) => ({ name: c.name.trim(), max: Number(c.max) }));
      const st = await updateSettings({ aiRubric: { criteria: clean } });
      setCriteria(st.aiRubric?.criteria || []);
      setMsg('Đã lưu thang điểm.');
      setTimeout(() => setMsg(''), 3000);
    } finally {
      setSavingRubric(false);
    }
  }

  return (
    <details className={`${PANEL} mb-8 group`}>
      <summary className="cursor-pointer list-none flex items-center justify-between gap-3 min-h-[44px]">
        <span className={PANEL_TITLE}>Cài đặt chung cho đề mẫu và đề thi thật</span>
        <span className={`${HINT} inline-flex items-center gap-1 shrink-0`}>
          <span className="group-open:hidden">Mở</span>
          <span className="hidden group-open:inline">Thu gọn</span>
          <CaretDown size={14} weight="bold" className="transition-transform group-open:rotate-180 motion-reduce:transition-none" aria-hidden="true" />
        </span>
      </summary>

      <div className="mt-4 space-y-6">
        <label className="flex items-start gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showOutlineTab}
            disabled={savingSwitch}
            onChange={toggleOutline}
            className="mt-0.5 h-5 w-5 accent-coral-500 cursor-pointer disabled:cursor-wait"
          />
          <span>
            <span className="block text-sm font-semibold text-slate-100">Hiện tab "Từ vựng và luận điểm" cho mọi người dùng</span>
            <span className={HINT}>Lúc mới ra mắt để tắt. Bật sau khoảng 10 ngày; khi bật, mọi tài khoản (kể cả Free) đều xem được.</span>
          </span>
        </label>

        <div>
          <p className="text-sm font-semibold text-slate-100">Thang điểm AI chấm bài</p>
          <p className={`${HINT} mb-3`}>Các tiêu chí và điểm tối đa AI dùng khi chấm. Tổng hiện tại: {total} điểm.</p>
          <ul className="space-y-2">
            {criteria.map((c, i) => (
              <li key={i} className="flex gap-2">
                <input
                  aria-label={`Tên tiêu chí ${i + 1}`}
                  value={c.name}
                  onChange={(e) => setRow(i, 'name', e.target.value)}
                  className={`${INPUT} flex-1`}
                />
                <input
                  aria-label={`Điểm tối đa tiêu chí ${i + 1}`}
                  type="number"
                  min="1"
                  value={c.max}
                  onChange={(e) => setRow(i, 'max', e.target.value)}
                  className={`${INPUT} w-24`}
                />
                <button
                  type="button"
                  onClick={() => setCriteria((rows) => rows.filter((_, j) => j !== i))}
                  aria-label={`Xoá tiêu chí ${i + 1}`}
                  className="min-h-[44px] min-w-[44px] grid place-items-center rounded-xl text-slate-500 hover:text-err transition-colors"
                >
                  <Trash size={18} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap items-center gap-3 mt-3">
            <button type="button" onClick={() => setCriteria((rows) => [...rows, { name: '', max: 10 }])} className={BTN_SECONDARY}>
              + Thêm tiêu chí
            </button>
            <button type="button" onClick={saveRubric} disabled={savingRubric} className={BTN_PRIMARY}>
              {savingRubric ? 'Đang lưu...' : 'Lưu thang điểm'}
            </button>
            {msg && (
              <span role="status" className="text-sm font-semibold text-ok">
                {msg}
              </span>
            )}
          </div>
        </div>
      </div>
    </details>
  );
}
