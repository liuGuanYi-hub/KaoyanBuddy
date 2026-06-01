import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CheckCircle2, Clock3, ListTodo, Target } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import StatCard from '../components/StatCard.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { minutesToHours } from '../utils/date.js';

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.dashboardSummary()
      .then(setSummary)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <Panel title="学习看板"><p className="text-sm text-slate-400">加载中...</p></Panel>;
  }

  if (error) {
    return <Panel title="学习看板"><p className="text-sm text-red-200">{error}</p></Panel>;
  }

  const dayData = (summary?.days || []).map((item) => ({
    date: item.date.slice(5),
    完成: item.completedTasks,
    学习分钟: item.actualMinutes,
  }));

  return (
    <div className="space-y-6">
      <Header title="学习看板" subtitle="本周任务、时长和科目进度" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="总任务" value={summary.totalTasks} detail="当前统计周期" icon={ListTodo} accent="text-sky-300" />
        <StatCard label="已完成" value={summary.completedTasks} detail={`${summary.completionRate}% 完成率`} icon={CheckCircle2} accent="text-emerald-300" />
        <StatCard label="计划时长" value={minutesToHours(summary.plannedMinutes)} detail="预计投入" icon={Target} accent="text-amber-300" />
        <StatCard label="实际时长" value={minutesToHours(summary.actualMinutes)} detail="已记录学习" icon={Clock3} accent="text-violet-300" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <Panel title="近 7 天">
          {dayData.length ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dayData}>
                  <XAxis dataKey="date" stroke="#94a3b8" tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,.12)', borderRadius: 8 }} />
                  <Bar dataKey="学习分钟" fill="#22c55e" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="完成" fill="#38bdf8" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState title="暂无统计数据" />
          )}
        </Panel>

        <Panel title="科目分布">
          {summary.subjects.length ? (
            <div className="grid gap-4 md:grid-cols-[180px_1fr] xl:grid-cols-1 2xl:grid-cols-[180px_1fr]">
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={summary.subjects} dataKey="actualMinutes" nameKey="subjectName" innerRadius={42} outerRadius={72}>
                      {summary.subjects.map((item) => <Cell key={item.subjectId} fill={item.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,.12)', borderRadius: 8 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3">
                {summary.subjects.map((item) => (
                  <div key={item.subjectId}>
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="flex items-center gap-2 text-slate-200">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        {item.subjectName}
                      </span>
                      <span className="text-slate-400">{minutesToHours(item.actualMinutes)}</span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-white/10">
                      <div
                        className="h-2 rounded-full"
                        style={{ width: `${Math.min(100, (item.completedTasks / Math.max(item.totalTasks, 1)) * 100)}%`, backgroundColor: item.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <EmptyState title="还没有科目进度" />
          )}
        </Panel>
      </div>
    </div>
  );
}

function Header({ title, subtitle }) {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-white">{title}</h2>
      <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
    </div>
  );
}

function Panel({ title, children }) {
  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.06] p-4">
      <h3 className="mb-4 text-base font-semibold text-white">{title}</h3>
      {children}
    </section>
  );
}
