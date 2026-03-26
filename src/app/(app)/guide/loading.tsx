// loading.tsx — skeleton chat guide
export default function Loading() {
  return (
    <div className="flex flex-col h-full px-4 py-6 space-y-4 animate-pulse">
      {/* Bulle guide */}
      <div className="flex items-end gap-2.5">
        <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'hsl(248 22% 12%)', flexShrink: 0 }} />
        <div style={{ width: '65%', height: 72, borderRadius: 16, background: 'hsl(248 22% 10%)' }} />
      </div>
      {/* Bulle user */}
      <div className="flex justify-end">
        <div style={{ width: '50%', height: 52, borderRadius: 16, background: 'hsl(248 22% 12%)' }} />
      </div>
      {/* Bulle guide */}
      <div className="flex items-end gap-2.5">
        <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'hsl(248 22% 12%)', flexShrink: 0 }} />
        <div style={{ width: '75%', height: 96, borderRadius: 16, background: 'hsl(248 22% 10%)' }} />
      </div>
    </div>
  )
}
