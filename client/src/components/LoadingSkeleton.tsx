export function LoadingSkeleton({ lines = 3, className = '' }: { lines?: number; className?: string }) {
  return (
    <div className={`animate-pulse space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-4 bg-slate-200 rounded" style={{ width: `${80 - i * 10}%` }} />
      ))}
    </div>
  );
}
