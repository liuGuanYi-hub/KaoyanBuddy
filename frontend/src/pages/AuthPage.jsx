import { GraduationCap } from 'lucide-react';
import { useState } from 'react';
import { isMockMode } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function AuthPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isRegister = mode === 'register';

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isRegister) {
        await register(form);
      } else {
        await login({ username: form.username, password: form.password });
      }
    } catch (err) {
      setError(err.message || '操作失败');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center px-4 py-10 text-slate-100">
      <section className="w-full max-w-md rounded-lg border border-white/10 bg-slate-950/75 p-6 shadow-2xl backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-lg bg-emerald-400 text-slate-950">
            <GraduationCap size={24} aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-white">KaoyanBuddy</h1>
            <p className="text-sm text-slate-400">考研规划助手</p>
          </div>
        </div>

        {isMockMode && (
          <p className="mt-5 rounded-lg border border-amber-300/25 bg-amber-400/10 px-3 py-2 text-sm text-amber-100">
            Mock 模式下可直接使用任意用户名和密码登录，系统会自动生成演示数据。
          </p>
        )}

        <div className="mt-6 grid grid-cols-2 rounded-lg border border-white/10 bg-white/[0.04] p-1">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`rounded-md px-3 py-2 text-sm ${!isRegister ? 'bg-white text-slate-950' : 'text-slate-300'}`}
          >
            登录
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`rounded-md px-3 py-2 text-sm ${isRegister ? 'bg-white text-slate-950' : 'text-slate-300'}`}
          >
            注册
          </button>
        </div>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <Field
            label="用户名"
            value={form.username}
            onChange={(value) => setForm((current) => ({ ...current, username: value }))}
            autoComplete="username"
          />
          {isRegister && (
            <Field
              label="邮箱"
              type="email"
              value={form.email}
              onChange={(value) => setForm((current) => ({ ...current, email: value }))}
              autoComplete="email"
            />
          )}
          <Field
            label="密码"
            type="password"
            value={form.password}
            onChange={(value) => setForm((current) => ({ ...current, password: value }))}
            autoComplete={isRegister ? 'new-password' : 'current-password'}
          />

          {error && <p className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-emerald-400 px-4 py-2.5 font-medium text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? '处理中...' : isRegister ? '创建账号' : '进入工作台'}
          </button>
        </form>
      </section>
    </main>
  );
}

function Field({ label, type = 'text', value, onChange, autoComplete }) {
  return (
    <label className="block">
      <span className="text-sm text-slate-300">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete={autoComplete}
        required
        className="mt-1 w-full rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2 text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-300"
      />
    </label>
  );
}
