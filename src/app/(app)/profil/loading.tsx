// loading.tsx — skeleton profil
export default function Loading() {
  return (
    <div className="mx-auto max-w-lg px-4 py-6 space-y-5 animate-pulse">
      {/* Card profil */}
      <div style={{ borderRadius: 16, background: 'hsl(248 22% 10%)', padding: 24 }}>
        <div className="flex items-start gap-4">
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'hsl(248 22% 14%)', flexShrink: 0 }} />
          <div className="flex-1 space-y-2 pt-1">
            <div style={{ width: '60%', height: 18, borderRadius: 8, background: 'hsl(248 22% 14%)' }} />
            <div style={{ width: '40%', height: 13, borderRadius: 8, background: 'hsl(248 22% 12%)' }} />
          </div>
        </div>
        <div style={{ marginTop: 20, height: 6, borderRadius: 999, background: 'hsl(248 22% 14%)' }} />
        <div style={{ marginTop: 8, height: 6, borderRadius: 999, background: 'hsl(38 52% 58% / 0.20)', width: '55%' }} />
      </div>
      {/* Abonnement */}
      <div style={{ height: 72, borderRadius: 16, background: 'hsl(248 22% 10%)' }} />
      {/* Langue */}
      <div style={{ height: 80, borderRadius: 16, background: 'hsl(248 22% 10%)' }} />
      {/* Nav */}
      <div style={{ borderRadius: 16, background: 'hsl(248 22% 10%)', padding: 8 }}>
        {[0,1,2,3,4].map(i => (
          <div key={i} style={{ height: 52, borderRadius: 10, background: 'hsl(248 22% 12%)', marginBottom: 4 }} />
        ))}
      </div>
    </div>
  )
}
