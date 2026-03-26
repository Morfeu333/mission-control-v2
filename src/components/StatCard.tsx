import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  icon: LucideIcon
  accent?: boolean
}

export default function StatCard({ label, value, sub, icon: Icon, accent }: StatCardProps) {
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 8, padding: '20px', display: 'flex', flexDirection: 'column', gap: 8
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{
          color: 'var(--text-muted)', fontSize: 11, fontFamily: 'system-ui',
          textTransform: 'uppercase', letterSpacing: 1
        }}>{label}</span>
        <Icon size={18} color={accent ? 'var(--accent)' : 'var(--text-muted)'} />
      </div>
      <div style={{
        fontFamily: 'Georgia,serif', fontSize: 36, fontWeight: 'bold',
        color: accent ? 'var(--accent)' : 'var(--text-primary)', lineHeight: 1
      }}>
        {value}
      </div>
      {sub && <div style={{ color: 'var(--text-muted)', fontSize: 12, fontFamily: 'system-ui' }}>{sub}</div>}
    </div>
  )
}
