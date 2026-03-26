const STATUS_MAP: Record<string, { label: string; color: string }> = {
  lead: { label: 'Lead', color: '#6B7280' },
  em_conversa: { label: 'Em Conversa', color: '#3B82F6' },
  escopo_definido: { label: 'Escopo', color: '#8B5CF6' },
  reuniao_agendada: { label: 'Reunião', color: '#F59E0B' },
  em_implementacao: { label: 'Em Impl.', color: '#10B981' },
  concluido: { label: 'Concluído', color: '#059669' },
  perdido: { label: 'Perdido', color: '#9CA3AF' },
}

export default function StatusBadge({ status }: { status: string }) {
  const s = STATUS_MAP[status] || { label: status, color: '#6B7280' }
  return (
    <span style={{
      color: s.color,
      border: `1px solid ${s.color}66`,
      borderRadius: 4, padding: '2px 8px',
      fontSize: 11, fontFamily: 'system-ui'
    }}>{s.label}</span>
  )
}
