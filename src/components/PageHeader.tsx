interface PageHeaderProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
}

export default function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div style={{
      marginBottom: 24, borderBottom: '2px solid var(--border)',
      paddingBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end'
    }}>
      <div>
        <h1 style={{
          fontFamily: 'Georgia,serif', fontSize: 28, fontWeight: 'bold',
          color: 'var(--text-primary)', margin: 0
        }}>{title}</h1>
        {subtitle && (
          <p style={{ color: 'var(--text-muted)', margin: '4px 0 0', fontSize: 13, fontFamily: 'system-ui' }}>
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div style={{ display: 'flex', gap: 8 }}>{actions}</div>}
    </div>
  )
}
