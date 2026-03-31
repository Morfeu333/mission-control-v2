import { useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { LayoutDashboard, Kanban, Radar, MessageSquare, Bot, Clock, BookOpen } from 'lucide-react'

const NAV = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/pipeline', icon: Kanban, label: 'Pipeline' },
  { path: '/scraper', icon: Radar, label: 'Scraper' },
  { path: '/sdr', icon: MessageSquare, label: 'SDR Inbox' },
  { path: '/agents', icon: Bot, label: 'Agents' },
  { path: '/crons', icon: Clock, label: 'Cron Jobs' },
  { path: '/memory', icon: BookOpen, label: 'Memory' },
]

export default function Sidebar() {
  const loc = useLocation()
  const [hoveredPath, setHoveredPath] = useState<string | null>(null)
  return (
    <aside style={{
      position: 'fixed', left: 0, top: 0, width: 220, height: '100vh',
      background: 'var(--bg-sidebar)', padding: '24px 0',
      display: 'flex', flexDirection: 'column', zIndex: 50
    }}>
      {/* Logo */}
      <div style={{ padding: '0 20px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ color: 'var(--accent)', fontFamily: 'Georgia,serif', fontWeight: 'bold', fontSize: 20, letterSpacing: 1 }}>
          MISSION
        </div>
        <div style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'Georgia,serif', fontSize: 10, letterSpacing: 4, marginTop: 2 }}>
          CONTROL
        </div>
      </div>
      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 0' }}>
        {NAV.map(({ path, icon: Icon, label }) => {
          const active = loc.pathname === path
          const hovered = hoveredPath === path
          return (
            <Link
              key={path}
              to={path}
              onMouseEnter={() => setHoveredPath(path)}
              onMouseLeave={() => setHoveredPath(null)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 20px',
                color: active ? 'white' : hovered ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.45)',
                background: active ? 'rgba(232,93,26,0.18)' : hovered ? 'rgba(255,255,255,0.06)' : 'transparent',
                borderLeft: active ? '3px solid var(--accent)' : '3px solid transparent',
                textDecoration: 'none', fontSize: 13,
                fontFamily: 'system-ui, sans-serif',
                transition: 'all 0.15s',
              }}
            >
              <Icon size={15} />
              {label}
            </Link>
          )
        })}
      </nav>
      {/* Footer */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10, fontFamily: 'monospace', letterSpacing: 1 }}>
          AUTOMATRIX IA
        </div>
        <div style={{ color: 'rgba(255,255,255,0.15)', fontSize: 10, fontFamily: 'monospace', marginTop: 2 }}>
          v2 · 2026
        </div>
      </div>
    </aside>
  )
}
