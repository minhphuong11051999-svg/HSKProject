import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUp, ArrowDown, Trash, Plus } from '@phosphor-icons/react';
import { getSettings, updateSettings } from '../api/settings';
import { listLessons } from '../api/lessons';
import PageHeader from '../components/PageHeader';
import { TextField } from '../components/admin/fields';
import {
  PANEL,
  PANEL_TITLE,
  HINT,
  BTN_PRIMARY,
  BTN_SECONDARY,
  BTN_ADD,
  BTN_TOOL,
  BTN_TOOL_DANGER,
  ERROR_TEXT,
  SUCCESS_TEXT,
} from '../components/admin/ui';
import { readLessonMap } from './Lessons';

const TOOL = `${BTN_TOOL} disabled:opacity-40 disabled:pointer-events-none`;
const TOOL_DANGER = `${BTN_TOOL_DANGER} disabled:opacity-40 disabled:cursor-not-allowed`;

// Planned rows have no id of their own; a local key keeps React inputs stable.
let rowSeq = 0;
const nextRowKey = () => `row-${++rowSeq}`;

// New entries get an id once, when they are created; it never changes afterwards
// because lessons store it in Lesson.category.
function newId(prefix, taken) {
  let id;
  do {
    id = `${prefix}-${Date.now().toString(36).slice(-4)}${Math.random().toString(36).slice(2, 5)}`;
  } while (taken.has(id));
  return id;
}

function toEditable(map) {
  return {
    criterion: map.criterion || '',
    groups: map.groups.map((g) => ({
      id: g.id,
      title: g.title || '',
      desc: g.desc || '',
      subs: g.subs.map((s) => ({
        id: s.id,
        label: s.label || '',
        planned: s.planned.map((p) => ({ key: nextRowKey(), zh: p.zh || '', vi: p.vi || '' })),
      })),
    })),
  };
}

function toSaved(edit) {
  return {
    criterion: edit.criterion.trim(),
    groups: edit.groups.map((g) => ({
      id: g.id,
      title: g.title.trim(),
      desc: g.desc.trim(),
      subs: g.subs.map((s) => ({
        id: s.id,
        label: s.label.trim(),
        planned: s.planned.map((p) => ({ zh: p.zh.trim(), vi: p.vi.trim() })).filter((p) => p.zh),
      })),
    })),
  };
}

function move(list, index, dir) {
  const target = index + dir;
  if (target < 0 || target >= list.length) return list;
  const next = [...list];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

export default function AdminLessonMap() {
  const [map, setMap] = useState(null);
  const [counts, setCounts] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [savedMessage, setSavedMessage] = useState('');

  useEffect(() => {
    getSettings()
      .then((s) => setMap(toEditable(readLessonMap(s?.lessonMap))))
      .catch((err) => setError(err.response?.data?.message || 'Không tải được phân loại bài học'));
    listLessons()
      .then((lessons) => {
        const out = {};
        for (const l of lessons) if (l.category) out[l.category] = (out[l.category] || 0) + 1;
        setCounts(out);
      })
      .catch(() => {});
  }, []);

  const allIds = () => new Set(map.groups.flatMap((g) => [g.id, ...g.subs.map((s) => s.id)]));
  const subCount = (sub) => counts[sub.id] || 0;
  const groupCount = (group) => group.subs.reduce((x, s) => x + subCount(s), 0);

  const setGroups = (fn) => setMap((prev) => ({ ...prev, groups: fn(prev.groups) }));
  const updateGroup = (gi, patch) => setGroups((gs) => gs.map((g, i) => (i === gi ? { ...g, ...patch } : g)));
  const setSubs = (gi, fn) => setGroups((gs) => gs.map((g, i) => (i === gi ? { ...g, subs: fn(g.subs) } : g)));
  const updateSub = (gi, si, patch) => setSubs(gi, (ss) => ss.map((s, i) => (i === si ? { ...s, ...patch } : s)));
  const setPlanned = (gi, si, fn) => setSubs(gi, (ss) => ss.map((s, i) => (i === si ? { ...s, planned: fn(s.planned) } : s)));

  function addGroup() {
    const id = newId('nhom', allIds());
    setGroups((gs) => [...gs, { id, title: '', desc: '', subs: [] }]);
  }

  function removeGroup(gi) {
    const g = map.groups[gi];
    if (groupCount(g) > 0) return;
    if (!confirm(`Xoá nhóm “${g.title || `Nhóm ${gi + 1}`}” và các nhóm con của nó?`)) return;
    setGroups((gs) => gs.filter((_, i) => i !== gi));
  }

  function addSub(gi) {
    const id = newId(map.groups[gi].id, allIds());
    setSubs(gi, (ss) => [...ss, { id, label: '', planned: [] }]);
  }

  function removeSub(gi, si) {
    const s = map.groups[gi].subs[si];
    if (subCount(s) > 0) return;
    if (!confirm(`Xoá nhóm con “${s.label || `Nhóm con ${si + 1}`}”?`)) return;
    setSubs(gi, (ss) => ss.filter((_, i) => i !== si));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSavedMessage('');
    const lessonMap = toSaved(map);
    if (lessonMap.groups.some((g) => !g.title)) {
      setError('Mỗi nhóm cần có tên.');
      return;
    }
    if (lessonMap.groups.some((g) => g.subs.some((s) => !s.label))) {
      setError('Mỗi nhóm con cần có tên.');
      return;
    }
    setSaving(true);
    try {
      const saved = await updateSettings({ lessonMap });
      setMap(toEditable(readLessonMap(saved?.lessonMap || lessonMap)));
      setSavedMessage('Đã lưu phân loại bài học.');
      setTimeout(() => setSavedMessage(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Lưu thất bại');
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <PageHeader
        title="Phân loại bài học"
        actions={
          <Link to="/lessons" className={BTN_SECONDARY}>
            Xem trang Bài học
          </Link>
        }
      >
        Các nhóm hiển thị trên trang Bài học; mỗi bài chọn nhóm con của mình ở{' '}
        <Link to="/admin" className="font-semibold text-coral-400 underline underline-offset-2">
          Quản trị bài học
        </Link>
        .
      </PageHeader>

      {!map ? (
        error ? (
          <p role="alert" className={ERROR_TEXT}>
            {error}
          </p>
        ) : (
          <p className="text-slate-500" role="status">
            Đang tải...
          </p>
        )
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <section className={PANEL} aria-labelledby="map-criterion">
            <h2 id="map-criterion" className={`${PANEL_TITLE} mb-4`}>
              Tiêu chí phân loại
            </h2>
            <TextField
              label="Câu hỏi hiển thị trong ô “Tiêu chí phân loại”"
              value={map.criterion}
              onChange={(v) => setMap((prev) => ({ ...prev, criterion: v }))}
            />
          </section>

          {map.groups.map((group, gi) => {
            const gCount = groupCount(group);
            return (
              <section key={group.id} className={PANEL} aria-labelledby={`group-${group.id}`}>
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <h2 id={`group-${group.id}`} className={PANEL_TITLE}>
                    Nhóm {gi + 1}
                    {group.title ? `: ${group.title}` : ''}
                    <span className="ml-2 text-sm font-semibold text-slate-400">· {gCount} bài</span>
                  </h2>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      className={TOOL}
                      onClick={() => setGroups((gs) => move(gs, gi, -1))}
                      disabled={gi === 0}
                      aria-label={`Đưa nhóm ${gi + 1} lên`}
                    >
                      <ArrowUp size={16} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      className={TOOL}
                      onClick={() => setGroups((gs) => move(gs, gi, 1))}
                      disabled={gi === map.groups.length - 1}
                      aria-label={`Đưa nhóm ${gi + 1} xuống`}
                    >
                      <ArrowDown size={16} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      className={TOOL_DANGER}
                      onClick={() => removeGroup(gi)}
                      disabled={gCount > 0}
                      aria-label={`Xoá nhóm ${gi + 1}`}
                      title={gCount > 0 ? 'Còn bài học trong nhóm này' : undefined}
                    >
                      <Trash size={16} aria-hidden="true" />
                    </button>
                  </div>
                </div>
                {gCount > 0 && (
                  <p className={`${HINT} mb-3`}>
                    Không xoá được nhóm khi còn {gCount} bài thuộc các nhóm con của nó. Chuyển các bài sang nhóm khác trong Quản trị bài
                    học trước.
                  </p>
                )}

                <div className="grid sm:grid-cols-2 gap-x-4">
                  <TextField label="Tên nhóm" value={group.title} onChange={(v) => updateGroup(gi, { title: v })} placeholder="Loại I · Có" />
                  <TextField label="Mô tả ngắn" value={group.desc} onChange={(v) => updateGroup(gi, { desc: v })} placeholder="Thỉnh cầu (xin, đề nghị)" />
                </div>

                <h3 className="mt-2 mb-3 text-sm font-bold uppercase tracking-wider text-slate-400">Nhóm con</h3>
                {group.subs.length === 0 && <p className={`${HINT} mb-3`}>Chưa có nhóm con nào.</p>}
                <ol className="space-y-4">
                  {group.subs.map((sub, si) => {
                    const sCount = subCount(sub);
                    return (
                      <li key={sub.id} className="rounded-xl border border-night-700 bg-night-900/60 p-4">
                        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                          <p className="font-bold text-slate-100">
                            {sub.label || `Nhóm con ${si + 1}`}
                            <span className="ml-2 text-sm font-semibold text-slate-400">· {sCount} bài đang dùng</span>
                          </p>
                          <div className="flex gap-1.5">
                            <button
                              type="button"
                              className={TOOL}
                              onClick={() => setSubs(gi, (ss) => move(ss, si, -1))}
                              disabled={si === 0}
                              aria-label={`Đưa nhóm con ${si + 1} lên`}
                            >
                              <ArrowUp size={16} aria-hidden="true" />
                            </button>
                            <button
                              type="button"
                              className={TOOL}
                              onClick={() => setSubs(gi, (ss) => move(ss, si, 1))}
                              disabled={si === group.subs.length - 1}
                              aria-label={`Đưa nhóm con ${si + 1} xuống`}
                            >
                              <ArrowDown size={16} aria-hidden="true" />
                            </button>
                            <button
                              type="button"
                              className={TOOL_DANGER}
                              onClick={() => removeSub(gi, si)}
                              disabled={sCount > 0}
                              aria-label={`Xoá nhóm con ${si + 1}`}
                              title={sCount > 0 ? 'Còn bài học trong nhóm con này' : undefined}
                            >
                              <Trash size={16} aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                        {sCount > 0 && (
                          <p className={`${HINT} mb-3`}>
                            Không xoá được: {sCount} bài đang chọn nhóm con này. Đổi “Phân loại” của các bài đó trong Quản trị bài học trước.
                          </p>
                        )}
                        <TextField label="Tên nhóm con" value={sub.label} onChange={(v) => updateSub(gi, si, { label: v })} placeholder="1.1 Cho bản thân" />
                        <p className={`${HINT} -mt-2 mb-3`}>
                          Mã: <code className="text-slate-300">{sub.id}</code>
                        </p>

                        <p className="mb-1 text-[13px] font-semibold text-slate-300">Dạng sắp có (thẻ “Đang soạn”)</p>
                        <p className={`${HINT} mb-3`}>Tự ẩn khi đã có bài cùng tiêu đề chữ Hán trong nhóm con này.</p>
                        {sub.planned.length > 0 && (
                          <ul className="space-y-2 mb-3">
                            {sub.planned.map((p, pi) => (
                              <li key={p.key} className="grid grid-cols-[1fr_1fr_auto] gap-x-3 items-end">
                                <TextField
                                  label="Chữ Hán"
                                  value={p.zh}
                                  onChange={(v) => setPlanned(gi, si, (ps) => ps.map((x, i) => (i === pi ? { ...x, zh: v } : x)))}
                                  placeholder="建议信"
                                />
                                <TextField
                                  label="Tiếng Việt"
                                  value={p.vi}
                                  onChange={(v) => setPlanned(gi, si, (ps) => ps.map((x, i) => (i === pi ? { ...x, vi: v } : x)))}
                                  placeholder="Thư đề xuất"
                                />
                                <button
                                  type="button"
                                  className={`${BTN_TOOL_DANGER} mb-3`}
                                  onClick={() => setPlanned(gi, si, (ps) => ps.filter((_, i) => i !== pi))}
                                  aria-label={`Xoá dạng ${p.zh || pi + 1}`}
                                >
                                  <Trash size={16} aria-hidden="true" />
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                        <button
                          type="button"
                          className={BTN_ADD}
                          onClick={() => setPlanned(gi, si, (ps) => [...ps, { key: nextRowKey(), zh: '', vi: '' }])}
                        >
                          <Plus size={16} weight="bold" aria-hidden="true" />
                          Thêm dạng sắp có
                        </button>
                      </li>
                    );
                  })}
                </ol>
                <button type="button" className={`${BTN_ADD} mt-4`} onClick={() => addSub(gi)}>
                  <Plus size={16} weight="bold" aria-hidden="true" />
                  Thêm nhóm con
                </button>
              </section>
            );
          })}

          <button type="button" className={BTN_ADD} onClick={addGroup}>
            <Plus size={16} weight="bold" aria-hidden="true" />
            Thêm nhóm
          </button>

          <div className="flex flex-wrap items-center gap-4">
            <button type="submit" className={BTN_PRIMARY} disabled={saving}>
              {saving ? 'Đang lưu...' : 'Lưu phân loại'}
            </button>
            <p role="status" className={SUCCESS_TEXT}>
              {savedMessage}
            </p>
          </div>
          {error && (
            <p role="alert" className={ERROR_TEXT}>
              {error}
            </p>
          )}
        </form>
      )}
    </main>
  );
}
