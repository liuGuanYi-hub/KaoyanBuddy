import { CalendarPlus, Check, Edit3, Plus, RefreshCcw, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import EmptyState from '../components/EmptyState.jsx';
import { minutesToHours, todayISO } from '../utils/date.js';

const blankTask = {
  subjectId: '',
  title: '',
  description: '',
  taskDate: todayISO(),
  status: 'TODO',
  priority: 'MEDIUM',
  plannedMinutes: 60,
  actualMinutes: 0,
};

const statusText = {
  TODO: '待开始',
  IN_PROGRESS: '进行中',
  DONE: '已完成',
};

const priorityText = {
  LOW: '低',
  MEDIUM: '中',
  HIGH: '高',
};

export default function TasksPage() {
  const [subjects, setSubjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [filters, setFilters] = useState({ date: todayISO(), status: '', subjectId: '' });
  const [form, setForm] = useState(blankTask);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.listSubjects(), api.listTasks(filters)])
      .then(([subjectData, taskData]) => {
        setSubjects(subjectData);
        setTasks(taskData);
        if (subjectData.length && !form.subjectId) {
          setForm((current) => ({ ...current, subjectId: String(subjectData[0].id) }));
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    reloadTasks();
  }, [filters]);

  function reloadTasks() {
    api.listTasks(filters)
      .then(setTasks)
      .catch((err) => setError(err.message));
  }

  async function reloadSubjects() {
    const data = await api.listSubjects();
    setSubjects(data);
    if (data.length && !form.subjectId) {
      setForm((current) => ({ ...current, subjectId: String(data[0].id) }));
    }
  }

  async function submit(event) {
    event.preventDefault();
    if (!form.subjectId) {
      setError('请先创建或生成科目');
      return;
    }

    setSaving(true);
    setError('');
    const payload = {
      ...form,
      subjectId: Number(form.subjectId),
      plannedMinutes: Number(form.plannedMinutes),
      actualMinutes: Number(form.actualMinutes || 0),
    };

    try {
      if (editingId) {
        await api.updateTask(editingId, payload);
      } else {
        await api.createTask(payload);
      }
      setForm(subjects.length ? { ...blankTask, subjectId: String(subjects[0].id), taskDate: filters.date || todayISO() } : blankTask);
      setEditingId(null);
      reloadTasks();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function generate() {
    setSaving(true);
    setError('');
    try {
      await api.generateTasks({ date: filters.date || todayISO(), totalMinutes: 360 });
      await reloadSubjects();
      reloadTasks();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function startEdit(task) {
    setEditingId(task.id);
    setForm({
      subjectId: String(task.subject.id),
      title: task.title,
      description: task.description || '',
      taskDate: task.taskDate,
      status: task.status,
      priority: task.priority,
      plannedMinutes: task.plannedMinutes,
      actualMinutes: task.actualMinutes,
    });
  }

  async function markDone(task) {
    const nextStatus = task.status === 'DONE' ? 'TODO' : 'DONE';
    await api.updateTaskStatus(task.id, {
      status: nextStatus,
      actualMinutes: nextStatus === 'DONE' ? task.actualMinutes || task.plannedMinutes : task.actualMinutes,
    });
    reloadTasks();
  }

  async function remove(id) {
    if (!window.confirm('确认删除这个任务？')) {
      return;
    }
    await api.deleteTask(id);
    reloadTasks();
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
      <section className="rounded-lg border border-white/10 bg-white/[0.06] p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">{editingId ? '编辑任务' : '新增任务'}</h2>
          {editingId && (
            <button
              type="button"
              onClick={() => { setEditingId(null); setForm(subjects.length ? { ...blankTask, subjectId: String(subjects[0].id) } : blankTask); }}
              className="rounded-lg p-2 text-slate-300 hover:bg-white/10"
            >
              <X size={18} aria-hidden="true" />
            </button>
          )}
        </div>
        <form onSubmit={submit} className="space-y-4">
          <label className="block">
            <span className="text-sm text-slate-300">科目</span>
            <select
              value={form.subjectId}
              onChange={(event) => setForm((current) => ({ ...current, subjectId: event.target.value }))}
              className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-white outline-none focus:border-emerald-300"
            >
              <option value="">未选择</option>
              {subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
            </select>
          </label>
          <Field label="标题" value={form.title} onChange={(value) => setForm((current) => ({ ...current, title: value }))} />
          <label className="block">
            <span className="text-sm text-slate-300">说明</span>
            <textarea
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              rows={3}
              className="mt-1 w-full resize-none rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2 text-white outline-none focus:border-emerald-300"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <Field label="日期" type="date" value={form.taskDate} onChange={(value) => setForm((current) => ({ ...current, taskDate: value }))} />
            <Field label="计划分钟" type="number" value={form.plannedMinutes} onChange={(value) => setForm((current) => ({ ...current, plannedMinutes: value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select label="状态" value={form.status} onChange={(value) => setForm((current) => ({ ...current, status: value }))} options={statusText} />
            <Select label="优先级" value={form.priority} onChange={(value) => setForm((current) => ({ ...current, priority: value }))} options={priorityText} />
          </div>
          <Field label="实际分钟" type="number" value={form.actualMinutes} onChange={(value) => setForm((current) => ({ ...current, actualMinutes: value }))} />
          {error && <p className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</p>}
          <button
            type="submit"
            disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-400 px-4 py-2.5 font-medium text-slate-950 hover:bg-emerald-300 disabled:opacity-60"
          >
            <Plus size={18} aria-hidden="true" />
            {editingId ? '保存任务' : '添加任务'}
          </button>
        </form>
      </section>

      <section className="rounded-lg border border-white/10 bg-white/[0.06] p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">任务列表</h2>
            <p className="mt-1 text-sm text-slate-400">{filters.date || '全部日期'}</p>
          </div>
          <div className="grid gap-2 sm:grid-cols-4 lg:w-[680px]">
            <input
              type="date"
              value={filters.date}
              onChange={(event) => setFilters((current) => ({ ...current, date: event.target.value }))}
              className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-emerald-300"
            />
            <select value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))} className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-emerald-300">
              <option value="">全部状态</option>
              {Object.entries(statusText).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
            <select value={filters.subjectId} onChange={(event) => setFilters((current) => ({ ...current, subjectId: event.target.value }))} className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-emerald-300">
              <option value="">全部科目</option>
              {subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
            </select>
            <button type="button" onClick={generate} disabled={saving} className="flex items-center justify-center gap-2 rounded-lg border border-emerald-300/30 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-100 hover:bg-emerald-400/20 disabled:opacity-60">
              <CalendarPlus size={16} aria-hidden="true" />
              生成
            </button>
          </div>
        </div>

        <div className="mt-4">
          {loading ? (
            <p className="text-sm text-slate-400">加载中...</p>
          ) : tasks.length ? (
            <div className="space-y-3">
              {tasks.map((task) => (
                <article key={task.id} className="rounded-lg border border-white/10 bg-slate-950/35 p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: task.subject.color }} />
                        <h3 className="font-medium text-white">{task.title}</h3>
                        <Badge>{task.subject.name}</Badge>
                        <Badge>{statusText[task.status]}</Badge>
                        <Badge>{priorityText[task.priority]}优先级</Badge>
                      </div>
                      {task.description && <p className="mt-2 text-sm text-slate-400">{task.description}</p>}
                      <p className="mt-3 text-sm text-slate-400">{task.taskDate} · 计划 {minutesToHours(task.plannedMinutes)} · 实际 {minutesToHours(task.actualMinutes)}</p>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <button type="button" onClick={() => markDone(task)} className="rounded-lg p-2 text-emerald-200 hover:bg-emerald-400/10" aria-label="切换完成状态">
                        {task.status === 'DONE' ? <RefreshCcw size={18} /> : <Check size={18} />}
                      </button>
                      <button type="button" onClick={() => startEdit(task)} className="rounded-lg p-2 text-slate-300 hover:bg-white/10" aria-label="编辑任务">
                        <Edit3 size={18} />
                      </button>
                      <button type="button" onClick={() => remove(task.id)} className="rounded-lg p-2 text-red-200 hover:bg-red-500/10" aria-label="删除任务">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState title="当前筛选条件下没有任务" />
          )}
        </div>
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
        required={label !== '实际分钟'}
        className="mt-1 w-full rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2 text-white outline-none focus:border-emerald-300"
      />
    </label>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="text-sm text-slate-300">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-white outline-none focus:border-emerald-300">
        {Object.entries(options).map(([optionValue, labelText]) => <option key={optionValue} value={optionValue}>{labelText}</option>)}
      </select>
    </label>
  );
}

function Badge({ children }) {
  return <span className="rounded-full border border-white/10 bg-white/[0.06] px-2 py-0.5 text-xs text-slate-300">{children}</span>;
}
