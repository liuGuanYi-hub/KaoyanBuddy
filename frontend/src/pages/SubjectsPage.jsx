import { Edit3, Plus, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import EmptyState from '../components/EmptyState.jsx';

const blankForm = { name: '', category: '公共课', color: '#22c55e', targetHours: 120 };
const colors = ['#22c55e', '#38bdf8', '#f59e0b', '#a78bfa', '#f43f5e', '#14b8a6'];

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState([]);
  const [form, setForm] = useState(blankForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    reload();
  }, []);

  function reload() {
    setLoading(true);
    api.listSubjects()
      .then(setSubjects)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  async function submit(event) {
    event.preventDefault();
    setError('');
    setSaving(true);
    const payload = { ...form, targetHours: Number(form.targetHours) };
    try {
      if (editingId) {
        await api.updateSubject(editingId, payload);
      } else {
        await api.createSubject(payload);
      }
      setForm(blankForm);
      setEditingId(null);
      reload();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function remove(id) {
    if (!window.confirm('确认删除这个科目及其任务？')) {
      return;
    }
    setError('');
    try {
      await api.deleteSubject(id);
      reload();
    } catch (err) {
      setError(err.message);
    }
  }

  function startEdit(subject) {
    setEditingId(subject.id);
    setForm({
      name: subject.name,
      category: subject.category,
      color: subject.color,
      targetHours: subject.targetHours,
    });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
      <section className="rounded-lg border border-white/10 bg-white/[0.06] p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">{editingId ? '编辑科目' : '新增科目'}</h2>
          {editingId && (
            <button type="button" onClick={() => { setEditingId(null); setForm(blankForm); }} className="rounded-lg p-2 text-slate-300 hover:bg-white/10">
              <X size={18} aria-hidden="true" />
            </button>
          )}
        </div>
        <form onSubmit={submit} className="space-y-4">
          <Field label="名称" value={form.name} onChange={(value) => setForm((current) => ({ ...current, name: value }))} />
          <Field label="分类" value={form.category} onChange={(value) => setForm((current) => ({ ...current, category: value }))} />
          <label className="block">
            <span className="text-sm text-slate-300">颜色</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {colors.map((color) => (
                <button
                  type="button"
                  key={color}
                  onClick={() => setForm((current) => ({ ...current, color }))}
                  className={`h-8 w-8 rounded-full border-2 ${form.color === color ? 'border-white' : 'border-transparent'}`}
                  style={{ backgroundColor: color }}
                  aria-label={`选择颜色 ${color}`}
                />
              ))}
            </div>
          </label>
          <Field
            label="目标小时"
            type="number"
            value={form.targetHours}
            onChange={(value) => setForm((current) => ({ ...current, targetHours: value }))}
          />
          {error && <p className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</p>}
          <button type="submit" disabled={saving} className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-400 px-4 py-2.5 font-medium text-slate-950 hover:bg-emerald-300 disabled:opacity-60">
            <Plus size={18} aria-hidden="true" />
            {saving ? '保存中...' : editingId ? '保存科目' : '添加科目'}
          </button>
        </form>
      </section>

      <section className="rounded-lg border border-white/10 bg-white/[0.06] p-4">
        <h2 className="mb-4 text-lg font-semibold text-white">科目列表</h2>
        {loading ? (
          <p className="text-sm text-slate-400">加载中...</p>
        ) : subjects.length ? (
          <div className="grid gap-3 md:grid-cols-2">
            {subjects.map((subject) => (
              <article key={subject.id} className="rounded-lg border border-white/10 bg-slate-950/35 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="flex items-center gap-2 font-medium text-white">
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: subject.color }} />
                      {subject.name}
                    </p>
                    <p className="mt-1 text-sm text-slate-400">{subject.category} · {subject.targetHours} 小时目标</p>
                  </div>
                  <div className="flex gap-1">
                    <button type="button" onClick={() => startEdit(subject)} className="rounded-lg p-2 text-slate-300 hover:bg-white/10" aria-label="编辑科目">
                      <Edit3 size={17} />
                    </button>
                    <button type="button" onClick={() => remove(subject.id)} className="rounded-lg p-2 text-red-200 hover:bg-red-500/10" aria-label="删除科目">
                      <Trash2 size={17} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState title="还没有科目" />
        )}
      </section>
    </div>
  );
}

function Field({ label, type = 'text', value, onChange }) {
  return (
    <label className="block">
      <span className="text-sm text-slate-300">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required
        className="mt-1 w-full rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2 text-white outline-none focus:border-emerald-300"
      />
    </label>
  );
}
