// loading.tsx — skeleton voies/cercles
export default function Loading() {
  return (
    <div className="mx-auto max-w-lg px-4 py-6 space-y-4 animate-pulse">
      <div className="space-y-2">
        <div style={{ width: 60, height: 11, borderRadius: 8, background: 'hsl(248 22% 12%)' }} />
        <div style={{ width: '60%', height: 28, borderRadius: 8, background: 'hsl(248 22% 12%)' }} />
      </div>
      {[0,1,2,3].map(i => (
        <div key={i} style={{ height: 100, borderRadius: 14, background: 'hsl(248 22% 10%)' }} />
      ))}
    </div>
  )
}
