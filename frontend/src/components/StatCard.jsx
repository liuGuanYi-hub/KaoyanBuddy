export default function StatCard({ label, value, detail, icon: Icon, accent = 'text-emerald-300' }) {
  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.06] p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-400">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
          {detail && <p className="mt-1 text-sm text-slate-400">{detail}</p>}
        </div>
        {Icon && (
          <div className={`rounded-lg bg-white/10 p-2 ${accent}`}>
            <Icon size={20} aria-hidden="true" />
          </div>
        )}
      </div>
    </section>
  );
}
