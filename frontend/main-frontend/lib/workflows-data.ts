import type { WorkflowGraph } from './workflows-service';

export type WorkflowStatus = "draft" | "published" | "paused" | "archived"
export type TriggerType = "event" | "segment_enter" | "manual"
export type NodeType = "trigger" | "email" | "delay" | "end"

export type TriggerConfig = { triggerType: TriggerType; eventName: string }
export type EmailConfig = { subject: string; fromEmail: string; fromName: string; htmlBody: string }
export type DelayConfig = { duration: number; unit: "minutes" | "hours" | "days" | "weeks" }

export type WorkflowNode = {
  id: string
  type: NodeType
  config: TriggerConfig | EmailConfig | DelayConfig | Record<string, never>
}

export type ExecutionStatus = "queued" | "running" | "waiting" | "completed" | "failed"

export type WorkflowExecution = {
  id: string
  contactId: string
  status: ExecutionStatus
  currentNodeId: string
  startedAt: string
  completedAt: string | null
}

export type Workflow = {
  id: string
  name: string
  status: WorkflowStatus
  nodes: WorkflowNode[]
  executionStats: { total: number; completed: number; failed: number; running: number }
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

export const UNIT_TO_SECONDS: Record<string, number> = {
  minutes: 60, hours: 3600, days: 86400, weeks: 604800,
}

const SECONDS_TO_UNIT = (s: number): { duration: number; unit: DelayConfig["unit"] } => {
  if (s % 604800 === 0) return { duration: s / 604800, unit: "weeks" }
  if (s % 86400 === 0) return { duration: s / 86400, unit: "days" }
  if (s % 3600 === 0) return { duration: s / 3600, unit: "hours" }
  return { duration: Math.round(s / 60), unit: "minutes" }
}

/** Convert API graph → local WorkflowNode[] */
export function graphToNodes(graph: WorkflowGraph): WorkflowNode[] {
  // Build ordered list by following edges from trigger
  const nodeMap = new Map(graph.nodes.map((n) => [n.id, n]))
  const edgeMap = new Map(graph.edges.map((e) => [e.from, e.to]))

  const trigger = graph.nodes.find((n) => n.type === "trigger")
  if (!trigger) return []

  const ordered: typeof graph.nodes = []
  let cur: string | undefined = trigger.id
  while (cur) {
    const node = nodeMap.get(cur)
    if (!node) break
    ordered.push(node)
    cur = edgeMap.get(cur)
  }

  return ordered.map((n): WorkflowNode => {
    const cfg = (n.config ?? {}) as Record<string, unknown>
    if (n.type === "trigger") {
      return { id: n.id, type: "trigger", config: { triggerType: (cfg.triggerType as TriggerType) ?? "event", eventName: (cfg.eventName as string) ?? "" } }
    }
    if (n.type === "email") {
      return { id: n.id, type: "email", config: { subject: (cfg.subject as string) ?? "", fromEmail: (cfg.fromEmail as string) ?? "", fromName: (cfg.fromName as string) ?? "", htmlBody: (cfg.html as string) ?? "" } }
    }
    if (n.type === "delay") {
      const secs = (cfg.durationSeconds as number) ?? 86400
      return { id: n.id, type: "delay", config: SECONDS_TO_UNIT(secs) }
    }
    return { id: n.id, type: "end", config: {} }
  })
}

/** Convert local WorkflowNode[] → API graph */
export function nodesToGraph(nodes: WorkflowNode[]): WorkflowGraph {
  const apiNodes = nodes.map((n) => {
    if (n.type === "trigger") {
      const c = n.config as TriggerConfig
      return { id: n.id, type: "trigger", config: { triggerType: c.triggerType, eventName: c.eventName } }
    }
    if (n.type === "email") {
      const c = n.config as EmailConfig
      return { id: n.id, type: "email", config: { subject: c.subject, fromEmail: c.fromEmail, fromName: c.fromName, html: c.htmlBody } }
    }
    if (n.type === "delay") {
      const c = n.config as DelayConfig
      return { id: n.id, type: "delay", config: { durationSeconds: c.duration * UNIT_TO_SECONDS[c.unit] } }
    }
    return { id: n.id, type: "end" }
  })
  const edges = nodes.slice(0, -1).map((n, i) => ({ from: n.id, to: nodes[i + 1].id }))
  return { nodes: apiNodes, edges }
}

function makeId() { return Math.random().toString(36).slice(2, 9) }

export function makeNode(type: NodeType): WorkflowNode {
  const configs: Record<NodeType, WorkflowNode["config"]> = {
    trigger: { triggerType: "event", eventName: "" },
    email: { subject: "", fromEmail: "", fromName: "", htmlBody: "" },
    delay: { duration: 1, unit: "days" },
    end: {},
  }
  return { id: makeId(), type, config: configs[type] }
}

export function defaultNodes(): WorkflowNode[] {
  return [makeNode("trigger"), makeNode("email"), makeNode("delay"), makeNode("end")]
}

export function validateNodes(nodes: WorkflowNode[]): string[] {
  const errors: string[] = []
  if (nodes[0]?.type !== "trigger") errors.push("First node must be a Trigger.")
  if (nodes[nodes.length - 1]?.type !== "end") errors.push("Last node must be an End node.")
  nodes.forEach((n, i) => {
    if (n.type === "trigger") {
      const c = n.config as TriggerConfig
      if (c.triggerType === "event" && !c.eventName.trim()) errors.push(`Node ${i + 1}: Event name required.`)
    }
    if (n.type === "email") {
      const c = n.config as EmailConfig
      if (!c.subject.trim()) errors.push(`Node ${i + 1}: Email subject required.`)
      if (!c.fromEmail.trim()) errors.push(`Node ${i + 1}: From email required.`)
      if (!c.htmlBody.trim()) errors.push(`Node ${i + 1}: Email HTML body required.`)
    }
    if (n.type === "delay") {
      const c = n.config as DelayConfig
      const secs = c.duration * UNIT_TO_SECONDS[c.unit]
      if (!c.duration || c.duration < 1) errors.push(`Node ${i + 1}: Delay duration must be ≥ 1.`)
      else if (secs < 60) errors.push(`Node ${i + 1}: Minimum delay is 1 minute.`)
      else if (secs > 31536000) errors.push(`Node ${i + 1}: Maximum delay is 365 days.`)
    }
  })
  return errors
}

export function nodeLabel(n: WorkflowNode): string {
  if (n.type === "trigger") {
    const c = n.config as TriggerConfig
    return c.eventName ? `Event: "${c.eventName}"` : c.triggerType.replace("_", " ")
  }
  if (n.type === "email") return (n.config as EmailConfig).subject || "Untitled Email"
  if (n.type === "delay") {
    const c = n.config as DelayConfig
    return `Wait ${c.duration} ${c.unit}`
  }
  return "End"
}

export function triggerLabel(nodes: WorkflowNode[]): string {
  const t = nodes.find((n) => n.type === "trigger")
  if (!t) return "—"
  const c = t.config as TriggerConfig
  const typeMap: Record<TriggerType, string> = { event: "Event", segment_enter: "Segment Enter", manual: "Manual" }
  return `${typeMap[c.triggerType]}${c.eventName ? `: ${c.eventName}` : ""}`
}
