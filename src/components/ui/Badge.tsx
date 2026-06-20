export function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: `${color}22`, color }}>
      {label}
    </span>
  );
}
