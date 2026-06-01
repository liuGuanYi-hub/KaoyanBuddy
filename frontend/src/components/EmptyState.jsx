export default function EmptyState({ title, action }) {
  return (
    <div className="rounded-lg border border-dashed border-white/15 bg-white/[0.04] p-8 text-center">
      <p className="text-sm text-slate-300">{title}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
