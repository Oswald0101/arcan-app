// loading.tsx — skeleton boutique
export default function Loading() {
  return (
    <div className="mx-auto max-w-lg px-4 py-6 space-y-5 animate-pulse">
      {/* Header */}
      <div className="space-y-2">
        <div style={{ width: 70, height: 11, borderRadius: 8, background: 'hsl(248 22% 12%)' }} />
        <div style={{ width: '70%', height: 28, borderRadius: 8, background: 'hsl(248 22% 12%)' }} />
        <div style={{ width: '90%', height: 14, borderRadius: 8, background: 'hsl(248 22% 10%)' }} />
      </div>
      {/* Tabs */}
      <div className="flex gap-2">
        {[0,1,2,3].map(i => (
          <div key={i} style={{ width: 80, height: 38, borderRadius: 10, background: 'hsl(248 22% 12%)' }} />
        ))}
      </div>
      {/* Produits */}
      {[0,1,2].map(i => (
        <div key={i} style={{ borderRadius: 16, background: 'hsl(248 22% 10%)', overflow: 'hidden' }}>
          <div style={{ height: 140, background: 'hsl(248 22% 12%)' }} />
          <div style={{ padding: 20 }}>
            <div style={{ width: '50%', height: 16, borderRadius: 8, background: 'hsl(248 22% 14%)', marginBottom: 8 }} />
            <div style={{ width: '80%', height: 12, borderRadius: 8, background: 'hsl(248 22% 12%)' }} />
          </div>
        </div>
      ))}
    </div>
  )
}
