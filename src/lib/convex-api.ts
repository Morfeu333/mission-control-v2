const BASE = '/convex-http/api/mc'

async function get(path: string) {
  const res = await fetch(`${BASE}${path}`)
  if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`)
  return res.json()
}

async function post(path: string, body: unknown) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Automatrix-Key': 'automatrix-mission-control'
    },
    body: JSON.stringify(body)
  })
  if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`)
  return res.json()
}

export const convexApi = {
  leads: {
    getPipelineCounts: () => get('/pipeline/counts'),
    getToday: () => get('/leads/today'),
    getHot: () => get('/leads/hot'),
    getUnprocessed: () => get('/leads/unprocessed'),
    pendingSdr: () => get('/leads/pending-sdr'),
    byStatus: (status: string) => get(`/leads?status=${encodeURIComponent(status)}`),
    byDedup: (key: string) => get(`/leads/by-dedup?key=${encodeURIComponent(key)}`),
    update: (body: unknown) => post('/leads/update', body),
    upsert: (body: unknown) => post('/leads/upsert', body),
    contact: (body: unknown) => post('/leads/contact', body),
    status: (body: unknown) => post('/leads/status', body),
  },
  messages: {
    byLead: (leadId: string) => get(`/messages?leadId=${encodeURIComponent(leadId)}`),
    record: (body: unknown) => post('/messages/record', body),
  },
  activities: {
    log: (body: unknown) => post('/activities/log', body),
    recent: (limit = 50) => get(`/activities/recent?limit=${limit}`),
  },
  agents: {
    heartbeat: (body: unknown) => post('/agents/heartbeat', body),
    getAll: () => get('/agents/all'),
  },
  agentRuns: {
    recent: (limit = 20) => get(`/runs/recent?limit=${limit}`),
    byAgent: (agentId: string, limit = 20) => get(`/runs/recent?agentId=${encodeURIComponent(agentId)}&limit=${limit}`),
  },
}
