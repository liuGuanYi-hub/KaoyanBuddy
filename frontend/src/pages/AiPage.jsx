import { Bot, Send, UserRound } from 'lucide-react';
import { useState } from 'react';
import { api } from '../api/client.js';

export default function AiPage() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '可以问我复习节奏、科目分配、错题复盘或任务拆解。', fallback: false },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault();
    const text = input.trim();
    if (!text) {
      return;
    }

    setInput('');
    setError('');
    setMessages((current) => [...current, { role: 'user', content: text }]);
    setLoading(true);

    try {
      const response = await api.chat({ message: text });
      setMessages((current) => [...current, { role: 'assistant', content: response.answer, fallback: response.fallback }]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto flex h-[calc(100vh-3rem)] max-w-4xl flex-col rounded-lg border border-white/10 bg-white/[0.06]">
      <div className="border-b border-white/10 p-4">
        <h2 className="text-lg font-semibold text-white">AI 问答</h2>
        <p className="mt-1 text-sm text-slate-400">DeepSeek 未配置时会返回本地降级答复</p>
      </div>
      <div className="scrollbar-thin flex-1 space-y-4 overflow-y-auto p-4">
        {messages.map((message, index) => (
          <div key={`${message.role}-${index}`} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {message.role === 'assistant' && <Avatar icon={Bot} tone="bg-emerald-400 text-slate-950" />}
            <div className={`max-w-[80%] rounded-lg px-4 py-3 text-sm leading-6 ${message.role === 'user' ? 'bg-sky-400 text-slate-950' : 'bg-slate-950/60 text-slate-100'}`}>
              <p className="whitespace-pre-wrap">{message.content}</p>
              {message.fallback && <p className="mt-2 text-xs text-amber-200">fallback</p>}
            </div>
            {message.role === 'user' && <Avatar icon={UserRound} tone="bg-sky-400 text-slate-950" />}
          </div>
        ))}
        {loading && <p className="text-sm text-slate-400">思考中...</p>}
        {error && <p className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</p>}
      </div>
      <form onSubmit={submit} className="border-t border-white/10 p-4">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            rows={2}
            className="min-h-[48px] flex-1 resize-none rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-white outline-none focus:border-emerald-300"
            placeholder="输入问题"
          />
          <button type="submit" disabled={loading} className="grid h-12 w-12 place-items-center rounded-lg bg-emerald-400 text-slate-950 hover:bg-emerald-300 disabled:opacity-60" aria-label="发送">
            <Send size={19} />
          </button>
        </div>
      </form>
    </section>
  );
}

function Avatar({ icon: Icon, tone }) {
  return (
    <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${tone}`}>
      <Icon size={18} aria-hidden="true" />
    </div>
  );
}
