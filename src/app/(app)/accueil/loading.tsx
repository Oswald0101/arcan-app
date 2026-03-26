// loading.tsx — skeleton visible pendant le fetch serveur
export default function Loading() {
  return (
    <div className="mx-auto max-w-lg px-4 py-6 space-y-5 animate-pulse">
      {/* XP ring placeholder */}
      <div className="flex flex-col items-center py-6 space-y-3">
        <div style={{ width: 96, height: 96, borderRadius: '50%', background: 'hsl(248 22% 12%)' }} />
        <div style={{ width: 140, height: 16, borderRadius: 8, background: 'hsl(248 22% 12%)' }} />
        <div style={{ width: 80, height: 12, borderRadius: 8, background: 'hsl(248 22% 10%)' }} />
      </div>
      {/* Card guide placeholder */}
      <div style={{ height: 160, borderRadius: 16, background: 'hsl(248 22% 10%)' }} />
      {/* Stats placeholders */}
      <div className="grid grid-cols-3 gap-3">
        {[0,1,2].map(i => (
          <div key={i} style={{ height: 80, borderRadius: 12, background: 'hsl(248 22% 10%)' }} />
        ))}
      </div>
      {/* Separator */}
      <div style={{ height: 1, background: 'hsl(248 22% 12%)' }} />
      {/* Badges placeholder */}
      <div className="grid grid-cols-4 gap-3">
        {[0,1,2,3].map(i => (
          <div key={i} style={{ height: 68, borderRadius: 12, background: 'hsl(248 22% 10%)' }} />
        ))}
      </div>
    </div>
  )
}
