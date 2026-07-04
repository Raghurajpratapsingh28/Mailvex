"use client"

import {
  FilterGroup, FilterRule, FilterTree,
  FILTER_FIELDS, OPERATORS_BY_TYPE,
  getFieldType, makeEmptyRule, makeEmptyGroup
} from "@/lib/segments-data"
import { Plus, X, ChevronDown } from "lucide-react"

interface Props {
  tree: FilterTree
  onChange: (tree: FilterTree) => void
  readOnly?: boolean
}

export default function FilterBuilder({ tree, onChange, readOnly = false }: Props) {
  return (
    <GroupNode
      group={tree}
      onChange={(updated) => onChange(updated as FilterTree)}
      onRemove={undefined}
      depth={0}
      readOnly={readOnly}
    />
  )
}

function GroupNode({
  group, onChange, onRemove, depth, readOnly
}: {
  group: FilterGroup
  onChange: (g: FilterGroup) => void
  onRemove?: () => void
  depth: number
  readOnly: boolean
}) {
  const updateChild = (idx: number, child: FilterRule | FilterGroup) => {
    const children = [...group.children]
    children[idx] = child
    onChange({ ...group, children })
  }

  const removeChild = (idx: number) => {
    onChange({ ...group, children: group.children.filter((_, i) => i !== idx) })
  }

  const addRule = () => {
    onChange({ ...group, children: [...group.children, makeEmptyRule()] })
  }

  const addGroup = () => {
    onChange({ ...group, children: [...group.children, makeEmptyGroup("OR")] })
  }

  const borderColor = depth === 0 ? "border-[#1C202C]" : "border-[#6B7280]/20"
  const bgColor = depth === 0 ? "bg-[#08090C]" : "bg-[#0A0B10]"

  return (
    <div className={`rounded-2xl border ${borderColor} ${bgColor} p-4 space-y-3`}>
      {/* Group header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 text-xs text-[#B0B8C8]">
          <span className="font-mono text-[#7A8499]">Match</span>
          {readOnly ? (
            <span className="px-2 py-0.5 bg-[#12141A] border border-[#1E2230] rounded-lg font-mono font-semibold text-[#9CA3AF]">
              {group.operator === "AND" ? "ALL" : "ANY"}
            </span>
          ) : (
            <div className="relative">
              <select
                value={group.operator}
                onChange={(e) => onChange({ ...group, operator: e.target.value as "AND" | "OR" })}
                className="appearance-none pl-2.5 pr-7 py-1 bg-[#12141A] border border-[#1E2230] hover:border-[#383E58] rounded-lg font-mono font-semibold text-[#9CA3AF] text-xs cursor-pointer focus:outline-none focus:border-[#6B7280]"
              >
                <option value="AND">ALL</option>
                <option value="OR">ANY</option>
              </select>
              <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[#7A8499] pointer-events-none" />
            </div>
          )}
          <span className="font-mono text-[#7A8499]">of the following rules</span>
        </div>

        <div className="flex items-center gap-1.5">
          {!readOnly && (
            <>
              <button
                onClick={addRule}
                className="flex items-center gap-1 px-2.5 py-1 bg-[#12141A] hover:bg-[#1C1F2D] border border-[#1E2230] hover:border-[#383E58] rounded-lg text-[10px] font-semibold text-[#B0B8C8] hover:text-white transition-all cursor-pointer"
              >
                <Plus className="w-3 h-3" /> Add Rule
              </button>
              {depth < 2 && (
                <button
                  onClick={addGroup}
                  className="flex items-center gap-1 px-2.5 py-1 bg-[#6B7280]/10 hover:bg-[#6B7280]/20 border border-[#6B7280]/25 hover:border-[#6B7280]/50 rounded-lg text-[10px] font-semibold text-[#9CA3AF] transition-all cursor-pointer"
                >
                  <Plus className="w-3 h-3" /> Add Group
                </button>
              )}
            </>
          )}
          {onRemove && !readOnly && (
            <button
              onClick={onRemove}
              className="p-1 rounded-lg hover:bg-red-500/10 text-[#7A8499] hover:text-red-400 transition-all cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Children */}
      <div className="space-y-2 pl-2">
        {group.children.map((child, idx) =>
          child.type === "rule" ? (
            <RuleNode
              key={child.id}
              rule={child}
              onChange={(r) => updateChild(idx, r)}
              onRemove={() => removeChild(idx)}
              readOnly={readOnly}
            />
          ) : (
            <GroupNode
              key={child.id}
              group={child}
              onChange={(g) => updateChild(idx, g)}
              onRemove={() => removeChild(idx)}
              depth={depth + 1}
              readOnly={readOnly}
            />
          )
        )}
        {group.children.length === 0 && (
          <p className="text-[10px] text-[#7A8499] font-mono pl-1">No rules yet. Add a rule above.</p>
        )}
      </div>
    </div>
  )
}

function getValueInputProps(fieldType: string, operator: string): {
  type: string
  placeholder: string
} {
  if (operator === "occurred_within_days") return { type: "number", placeholder: "days (e.g. 30)" }
  if (operator === "in" || operator === "not_in") return { type: "text", placeholder: "val1,val2,val3" }
  if (fieldType === "number") return { type: "number", placeholder: "value..." }
  return { type: "text", placeholder: "value..." }
}

function RuleNode({
  rule, onChange, onRemove, readOnly
}: {
  rule: FilterRule
  onChange: (r: FilterRule) => void
  onRemove: () => void
  readOnly: boolean
}) {
  const fieldType = getFieldType(rule.field)
  const operators = OPERATORS_BY_TYPE[fieldType] ?? OPERATORS_BY_TYPE.string
  const noValue = rule.operator === "exists" || rule.operator === "not_exists"
  const { type: inputType, placeholder } = getValueInputProps(fieldType, rule.operator)

  if (readOnly) {
    const fieldLabel = FILTER_FIELDS.find((f) => f.value === rule.field)?.label ?? rule.field
    const opLabel = operators.find((o) => o.value === rule.operator)?.label ?? rule.operator
    return (
      <div className="flex items-center gap-2 flex-wrap px-3 py-2 bg-[#12141A] border border-[#1E2230] rounded-xl text-xs">
        <span className="font-mono text-[#9CA3AF]">{fieldLabel}</span>
        <span className="text-[#7A8499]">{opLabel}</span>
        {!noValue && rule.value && (
          <span className="font-mono text-white/80 bg-[#1C1F2D] px-2 py-0.5 rounded-lg">{rule.value}</span>
        )}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 flex-wrap px-3 py-2 bg-[#12141A] border border-[#1E2230] rounded-xl">
      {/* Field selector */}
      <SelectField
        value={rule.field}
        onChange={(v) => {
          const newType = getFieldType(v)
          const newOps = OPERATORS_BY_TYPE[newType]
          const validOp = newOps.find((o) => o.value === rule.operator) ? rule.operator : newOps[0].value
          onChange({ ...rule, field: v, operator: validOp, value: "" })
        }}
        options={FILTER_FIELDS.map((f) => ({ value: f.value, label: f.label }))}
        className="min-w-[140px]"
      />

      {/* Operator selector */}
      <SelectField
        value={rule.operator}
        onChange={(v) => onChange({ ...rule, operator: v as FilterRule["operator"], value: "" })}
        options={operators}
        className="min-w-[120px]"
      />

      {/* Value input */}
      {!noValue && (
        <div className="flex-1 min-w-[120px] relative">
          <input
            type={inputType}
            value={rule.value}
            onChange={(e) => onChange({ ...rule, value: e.target.value })}
            placeholder={placeholder}
            min={inputType === "number" ? 0 : undefined}
            className="w-full px-2.5 py-1 bg-[#08090C] border border-[#1E2230] hover:border-[#383E58] focus:border-[#6B7280] rounded-lg text-xs text-white/90 placeholder-[#7A8499] font-mono focus:outline-none transition-colors"
          />
          {(rule.operator === "in" || rule.operator === "not_in") && (
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-[#7A8499] pointer-events-none font-mono">
              csv
            </span>
          )}
          {rule.operator === "occurred_within_days" && (
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-[#7A8499] pointer-events-none font-mono">
              days
            </span>
          )}
        </div>
      )}

      <button
        onClick={onRemove}
        className="p-1 rounded-lg hover:bg-red-500/10 text-[#7A8499] hover:text-red-400 transition-all cursor-pointer ml-auto"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

function SelectField({
  value, onChange, options, className = ""
}: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  className?: string
}) {
  return (
    <div className={`relative ${className}`}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none pl-2.5 pr-7 py-1 bg-[#08090C] border border-[#1E2230] hover:border-[#383E58] focus:border-[#6B7280] rounded-lg text-xs text-white/90 font-mono cursor-pointer focus:outline-none transition-colors"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[#7A8499] pointer-events-none" />
    </div>
  )
}
