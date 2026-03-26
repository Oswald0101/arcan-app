// loading.tsx — skeleton communauté
export default function Loading() {
  return (
    <div className="mx-auto max-w-lg px-4 py-6 space-y-4 animate-pulse">
      <div style={{ width: '50%', height: 28, borderRadius: 8, background: 'hsl(248 22% 12%)' }} />
      {[0,1,2,3,4].map(i => (
        <div key={i} className="flex items-center gap-3" style={{ padding: '12px 0' }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'hsl(248 22% 12%)', flexShrink: 0 }} />
          <div className="flex-1 space-y-2">
            <div style={{ width: '50%', height: 14, borderRadius: 8, background: 'hsl(248 22% 12%)' }} />
            <div style={{ width: '70%', height: 11, borderRadius: 8, background: 'hsl(248 22% 10%)' }} />
          </div>
        </div>
      ))}
    </div>
  )
}
