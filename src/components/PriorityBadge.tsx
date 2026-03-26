export default function PriorityBadge({ priority }: { priority: string }) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    hot: { label: '🔥 HOT', color: '#DC2626', bg: '#FEF2F2' },
    warm: { label: '⭐ WARM', color: '#D97706', bg: '#FFFBEB' },
    cold: { label: '❄️ COLD', color: '#2563EB', bg: '#EFF6FF' },
  }
  const s = map[priority] || { label: priority.toUpperCase(), color: '#6B7280', bg: '#F9FAFB' }
  return (
    <span style={{
      background: s.bg, color: s.color,
      border: `1px solid ${s.color}33`,
      borderRadius: 4, padding: '2px 8px',
      fontSize: 11, fontFamily: 'system-ui', fontWeight: 600
    }}>{s.label}</span>
  )
}
