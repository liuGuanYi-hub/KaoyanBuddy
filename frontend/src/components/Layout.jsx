import { BarChart3, Bot, CalendarCheck2, LogOut, Menu, NotebookTabs, PanelsTopLeft, X } from 'lucide-react';
import { useState } from 'react';
import { isMockMode } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

const navItems = [
  { id: 'dashboard', label: '看板', icon: PanelsTopLeft },
  { id: 'tasks', label: '任务', icon: CalendarCheck2 },
  { id: 'subjects', label: '科目', icon: NotebookTabs },
  { id: 'ai', label: '问答', icon: Bot },
];

export default function Layout({ activeView, onViewChange, children }) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const nav = (
    <nav className="space-y-2">
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = activeView === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              onViewChange(item.id);
              setOpen(false);
            }}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${
              active
                ? 'bg-emerald-400/15 text-emerald-200 ring-1 ring-emerald-300/30'
                : 'text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Icon size={18} aria-hidden="true" />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen text-slate-100">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-white/10 bg-slate-950/80 px-4 py-5 backdrop-blur lg:block">
        <Brand />
        <div className="mt-8">{nav}</div>
        <UserPanel user={user} logout={logout} />
      </aside>

      <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/80 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between">
          <Brand compact />
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="rounded-lg border border-white/10 p-2 text-slate-200"
            aria-label="切换导航"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        {open && <div className="mt-4">{nav}</div>}
      </header>

      <main className="lg:pl-64">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {isMockMode && (
            <div className="mb-4 rounded-lg border border-amber-300/25 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
              当前为 Mock 演示模式，页面数据保存在浏览器本地存储中。
            </div>
          )}
          {children}
        </div>
      </main>
    </div>
  );
}

function Brand({ compact = false }) {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-400 text-slate-950">
        <BarChart3 size={22} aria-hidden="true" />
      </div>
      {!compact && (
        <div>
          <p className="text-lg font-semibold text-white">KaoyanBuddy</p>
          <p className="text-xs text-slate-400">考研规划助手</p>
        </div>
      )}
    </div>
  );
}

function UserPanel({ user, logout }) {
  return (
    <div className="absolute bottom-5 left-4 right-4 rounded-lg border border-white/10 bg-white/[0.05] p-3">
      <p className="truncate text-sm font-medium text-white">{user?.username}</p>
      <p className="truncate text-xs text-slate-400">{user?.email}</p>
      <button
        type="button"
        onClick={logout}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-200 hover:bg-white/10"
      >
        <LogOut size={16} aria-hidden="true" />
        退出
      </button>
    </div>
  );
}
