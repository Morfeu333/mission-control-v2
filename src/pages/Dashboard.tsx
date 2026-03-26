import { useState, useEffect, useCallback } from 'react'
import { Users, Flame, TrendingUp, RefreshCw } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import StatCard from '../components/StatCard'
import StatusBadge from '../components/StatusBadge'
import PriorityBadge from '../components/PriorityBadge'
import { convexApi } from '../lib/convex-api'
import { oc } from '../lib/openclaw-api'
import { usePolling } from '../lib/usePolling'

interface Lead {
  _id: string
  authorName: string
  priority: string
  status: string
  captureDate: number
  whatsapp: string
  automationAngle: string
}

interface Activity {
  _id: string
  type: string
  agentId: string
  message: string
  timestamp: number
}

interface Agent {
  agentId: string
  name: string
  status: 'idle' | 'running' | 'error'
  lastHeartbeat: number
  lastRunStatus: string
  consecutiveErrors: number
}

interface PipelineCounts {
  lead: number
  em_conversa: number
  escopo_definido: number
  reuniao_agendada: number
  em_implementacao: number
  concluido: number
  perdido: number
}

function LiveClock() {
  const [time, setTime] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  return (
    <span style={{ fontFamily: 'monospace', fontSize: 16, color: 'var(--text-secondary)' }}>
      {time.toLocaleTimeString('pt-BR')}
    </span>
  )
}

function timeAgo(ts: number) {
  const s = Math.floor((Date.now() - ts) / 1000)
  if (s < 60) return `${s}s ago`
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  return `${Math.floor(s / 3600)}h ago`
}

const ACTIVITY_COLORS: Record<string, string> = {
  lead_created: '#10B981',
  lead_updated: '#3B82F6',
  status_changed: '#8B5CF6',
  dm_sent: '#F59E0B',
  comment_posted: '#F59E0B',
  contact_captured: '#E85D1A',
  meeting_scheduled: '#DC2626',
  notion_synced: '#059669',
  agent_run: '#6B7280',
}

export default function Dashboard() {
  const countsFetcher = useCallback(() => convexApi.leads.getPipelineCounts(), [])
  const todayFetcher = useCallback(() => convexApi.leads.getToday(), [])
  const hotFetcher = useCallback(() => convexApi.leads.getHot(), [])
  const activitiesFetcher = useCallback(() => convexApi.activities.recent(30), [])
  const agentsFetcher = useCallback(() => convexApi.agents.getAll(), [])
  const ocStatusFetcher = useCallback(() => oc.status(), [])

  const { data: counts } = usePolling<PipelineCounts>(countsFetcher, 15000)
  const { data: todayLeads } = usePolling<Lead[]>(todayFetcher, 15000, [])
  const { data: hotLeads } = usePolling<Lead[]>(hotFetcher, 15000, [])
  const { data: activities } = usePolling<Activity[]>(activitiesFetcher, 8000, [])
  const { data: agents } = usePolling<Agent[]>(agentsFetcher, 15000, [])
  const { data: ocStatus } = usePolling(ocStatusFetcher, 30000)

  const totalPipeline = counts
    ? Object.values(counts).reduce((a, b) => a + b, 0)
    : 0

  const pendingNotion = todayLeads?.filter((l: any) => !l.notionSynced).length ?? 0

  return (
    <div>
      {/* Top bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{
            fontFamily: 'Georgia,serif', fontSize: 30, fontWeight: 'bold',
            color: 'var(--text-primary)', margin: 0, letterSpacing: 1
          }}>MISSION CONTROL</h1>
          <p style={{ color: 'var(--text-muted)', margin: '4px 0 0', fontSize: 13, fontFamily: 'system-ui' }}>
            Automatrix IA — Lead Pipeline Dashboard
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 8, padding: '8px 20px', display: 'flex', gap: 24, alignItems: 'center'
          }}>
            <span style={{ fontFamily: 'system-ui', fontSize: 13, color: 'var(--text-muted)' }}>
              <strong style={{ color: 'var(--text-primary)', fontSize: 22, fontFamily: 'Georgia,serif' }}>
                {totalPipeline}
              </strong>{' '}total
            </span>
            <span style={{ width: 1, height: 24, background: 'var(--border)' }} />
            <span style={{ fontFamily: 'system-ui', fontSize: 13, color: 'var(--text-muted)' }}>
              <strong style={{ color: 'var(--accent)', fontSize: 22, fontFamily: 'Georgia,serif' }}>
                {hotLeads?.length || 0}
              </strong>{' '}hot
            </span>
          </div>
          <LiveClock />
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 24 }}>
        <StatCard label="Hoje" value={todayLeads?.length || 0} icon={TrendingUp} sub="leads capturados" />
        <StatCard label="HOT Leads" value={hotLeads?.length || 0} icon={Flame} accent sub="precisam atenção" />
        <StatCard label="Pendente Notion" value={pendingNotion} icon={RefreshCw} sub="aguardando sync" />
        <StatCard label="Total Pipeline" value={totalPipeline} icon={Users} sub="todos os estágios" />
      </div>

      {/* Main 3-col grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '190px 1fr 300px', gap: 16 }}>

        {/* Left: Agents panel */}
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 8, padding: 16
        }}>
          <h3 style={{
            fontFamily: 'Georgia,serif', fontSize: 12, fontWeight: 'bold',
            color: 'var(--text-secondary)', margin: '0 0 12px',
            textTransform: 'uppercase', letterSpacing: 1.5
          }}>Agents</h3>

          {(!agents || agents.length === 0) && (
            <p style={{ color: 'var(--text-muted)', fontSize: 12, fontFamily: 'system-ui' }}>
              Sem heartbeat...
            </p>
          )}
          {agents?.map((agent: Agent) => (
            <div key={agent.agentId} style={{
              padding: '8px 0', borderBottom: '1px solid var(--border)',
              display: 'flex', alignItems: 'flex-start', gap: 8
            }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%', marginTop: 3, flexShrink: 0,
                background: agent.status === 'running' ? '#10B981'
                  : agent.status === 'error' ? '#DC2626' : '#D1D5DB'
              }} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 12, fontFamily: 'system-ui', fontWeight: 500 }}>
                  {agent.name}
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                  {agent.status}
                </div>
                {agent.consecutiveErrors > 0 && (
                  <div style={{ fontSize: 10, color: '#DC2626', fontFamily: 'monospace' }}>
                    {agent.consecutiveErrors} err
                  </div>
                )}
                <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                  {timeAgo(agent.lastHeartbeat)}
                </div>
              </div>
            </div>
          ))}

          {/* OpenClaw status */}
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'system-ui', marginBottom: 2 }}>
              OpenClaw
            </div>
            <div style={{
              fontSize: 12, fontFamily: 'monospace',
              color: ocStatus ? '#10B981' : '#DC2626'
            }}>
              {ocStatus && (ocStatus as any).ok === true
                ? 'live ✓'
                : 'offline'}
            </div>
          </div>
        </div>

        {/* Center: Pipeline overview */}
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 8, padding: 16
        }}>
          <h3 style={{
            fontFamily: 'Georgia,serif', fontSize: 12, fontWeight: 'bold',
            color: 'var(--text-secondary)', margin: '0 0 16px',
            textTransform: 'uppercase', letterSpacing: 1.5
          }}>Pipeline Overview</h3>

          {counts ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 8, marginBottom: 20 }}>
              {Object.entries(counts).map(([status, count]) => (
                <div key={status} style={{
                  background: 'var(--bg-secondary)', borderRadius: 6,
                  padding: '12px 6px', textAlign: 'center'
                }}>
                  <div style={{
                    fontSize: 28, fontFamily: 'Georgia,serif', fontWeight: 'bold',
                    color: 'var(--text-primary)', lineHeight: 1, marginBottom: 6
                  }}>{count as number}</div>
                  <StatusBadge status={status} />
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: 'var(--text-muted)', fontSize: 13, fontFamily: 'system-ui' }}>
              Carregando...
            </div>
          )}

          {/* Hot leads */}
          {(hotLeads?.length || 0) > 0 && (
            <div>
              <div style={{
                fontSize: 11, fontWeight: 600, color: 'var(--hot)',
                marginBottom: 8, fontFamily: 'system-ui', textTransform: 'uppercase', letterSpacing: 1
              }}>
                🔥 Hot Leads ({hotLeads!.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {hotLeads?.slice(0, 6).map((lead: Lead) => (
                  <div key={lead._id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '7px 10px', background: '#FEF2F2',
                    border: '1px solid #FECACA', borderRadius: 6
                  }}>
                    <span style={{ fontSize: 12, fontFamily: 'system-ui', fontWeight: 500 }}>
                      {lead.authorName}
                    </span>
                    <StatusBadge status={lead.status} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Activity feed */}
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 8, padding: 16, display: 'flex', flexDirection: 'column'
        }}>
          <h3 style={{
            fontFamily: 'Georgia,serif', fontSize: 12, fontWeight: 'bold',
            color: 'var(--text-secondary)', margin: '0 0 12px',
            textTransform: 'uppercase', letterSpacing: 1.5
          }}>Live Feed</h3>

          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column', gap: 6,
            maxHeight: 480, overflowY: 'auto'
          }}>
            {(!activities || activities.length === 0) && (
              <p style={{ color: 'var(--text-muted)', fontSize: 12, fontFamily: 'system-ui' }}>
                Sem atividades ainda...
              </p>
            )}
            {activities?.map((act: Activity) => (
              <div key={act._id} style={{
                padding: '8px 10px', background: 'var(--bg-secondary)',
                borderRadius: 6,
                borderLeft: `3px solid ${ACTIVITY_COLORS[act.type] || '#6B7280'}`
              }}>
                <div style={{ fontSize: 12, fontFamily: 'system-ui', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                  {act.message}
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: 3 }}>
                  {act.agentId} · {new Date(act.timestamp).toLocaleTimeString('pt-BR')}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
