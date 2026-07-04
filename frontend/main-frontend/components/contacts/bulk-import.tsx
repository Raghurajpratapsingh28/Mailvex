"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, X, CheckCircle2, ChevronRight, FileText, Loader2, AlertCircle, Copy, Check } from "lucide-react"
import { contactsService } from "@/lib/contacts-service"
import { ApiError } from "@/lib/api-client"

interface BulkImportProps {
  isOpen: boolean
  workspaceId: string
  onClose: () => void
  onImportComplete: (importedCount: number, skippedCount: number) => void
}

const CSV_FORMAT = `email,first_name,last_name,phone,lifecycle_stage,lead_score
john@example.com,John,Doe,+1234567890,lead,0
jane@example.com,Jane,Smith,,customer,80
bob@example.com,Bob,,,subscriber,`

const REQUIRED_HEADER = "email"
const OPTIONAL_HEADERS = ["first_name", "last_name", "phone", "lifecycle_stage", "lead_score"]
const LIFECYCLE_VALUES = ["lead", "prospect", "customer", "churned", "unqualified"]

function parseCSV(text: string): { rows: Record<string, string>[]; errors: string[] } {
  const lines = text.trim().split(/\r?\n/).filter(Boolean)
  if (lines.length < 2) return { rows: [], errors: ["CSV must have a header row and at least one data row."] }

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/\s+/g, "_"))
  if (!headers.includes(REQUIRED_HEADER)) {
    return { rows: [], errors: [`Missing required column: "email". Found: ${headers.join(", ")}`] }
  }

  const rows: Record<string, string>[] = []
  for (let i = 1; i < lines.length; i++) {
    const vals = lines[i].split(",").map((v) => v.trim().replace(/^"|"$/g, ""))
    const row: Record<string, string> = {}
    headers.forEach((h, idx) => { row[h] = vals[idx] ?? "" })
    if (row.email) rows.push(row)
  }

  return { rows, errors: [] }
}

export default function BulkImport({ isOpen, workspaceId, onClose, onImportComplete }: BulkImportProps) {
  const [step, setStep] = useState<"upload" | "preview" | "loading" | "result">("upload")
  const [fileName, setFileName] = useState("")
  const [parsedRows, setParsedRows] = useState<Record<string, string>[]>([])
  const [parseErrors, setParseErrors] = useState<string[]>([])
  const [importResult, setImportResult] = useState({ imported: 0, skipped: 0 })
  const [importError, setImportError] = useState("")
  const [copied, setCopied] = useState(false)

  const handleFile = useCallback((file: File) => {
    if (!file.name.endsWith(".csv")) {
      setParseErrors(["Only CSV files are supported."])
      return
    }
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const { rows, errors } = parseCSV(text)
      setParseErrors(errors)
      setParsedRows(rows)
      if (errors.length === 0 && rows.length > 0) setStep("preview")
    }
    reader.readAsText(file)
  }, [])

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const handleImport = async () => {
    setStep("loading")
    setImportError("")
    try {
      const contacts = parsedRows.map((row) => ({
        email: row.email,
        firstName: row.first_name || undefined,
        lastName: row.last_name || undefined,
        phone: row.phone || undefined,
        lifecycleStage: LIFECYCLE_VALUES.includes(row.lifecycle_stage) ? row.lifecycle_stage : undefined,
        leadScore: row.lead_score ? Number(row.lead_score) || 0 : undefined,
      }))
      const res = await contactsService.bulkImport(workspaceId, contacts)
      setImportResult(res)
      setStep("result")
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Import failed"
      setImportError(msg)
      setStep("preview")
    }
  }

  const handleFinish = () => {
    onImportComplete(importResult.imported, importResult.skipped)
    onClose()
    setStep("upload")
    setFileName("")
    setParsedRows([])
    setParseErrors([])
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(CSV_FORMAT)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const reset = () => {
    setStep("upload")
    setFileName("")
    setParsedRows([])
    setParseErrors([])
    setImportError("")
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-50 cursor-pointer"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="fixed inset-0 m-auto w-full max-w-lg h-fit max-h-[90vh] rounded-[16px] bg-[#0D0E12] border border-[#202126] text-[#FFFFFF] z-50 flex flex-col font-sans overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="p-5 border-b border-[#202126] bg-[#0D0E12] flex items-center justify-between shrink-0">
              <div>
                <span className="text-[10px] text-[#8A8D96] font-medium uppercase tracking-widest">CSV Bulk Importer</span>
                <h3 className="text-sm font-semibold text-[#FFFFFF] mt-1">Import Contacts</h3>
              </div>
              <button onClick={onClose} className="p-1.5 hover:bg-[#25262B] border border-transparent hover:border-[#202126] rounded-[8px] text-[#8A8D96] hover:text-[#FFFFFF] transition-colors cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">

              {step === "upload" && (
                <>
                  {/* Drop zone */}
                  <div
                    onDragOver={(e) => e.preventDefault()} onDrop={handleDrop}
                    className="border-2 border-dashed border-[#202126] hover:border-[#8A8D96] rounded-[16px] p-8 flex flex-col items-center justify-center text-center cursor-pointer bg-transparent hover:bg-[#18191C]/50 transition-all relative group"
                  >
                    <input type="file" accept=".csv" onChange={handleFileSelect} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    <div className="p-3.5 rounded-[12px] bg-[#25262B] border border-[#202126] text-[#8A8D96] group-hover:scale-105 transition-transform mb-4">
                      <Upload className="w-6 h-6" />
                    </div>
                    <h4 className="text-xs font-semibold text-[#FFFFFF]">Drag & drop your CSV here</h4>
                    <p className="text-[10px] text-[#8A8D96] font-medium mt-1.5">CSV only · Max 1,000 rows</p>
                    <button className="mt-4 px-3 py-1.5 bg-[#18191C] border border-[#202126] text-[10px] text-[#8A8D96] font-semibold rounded-[8px] pointer-events-none">
                      Select File
                    </button>
                  </div>

                  {parseErrors.length > 0 && (
                    <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/20 flex items-start gap-2">
                      <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                      <p className="text-[10px] text-red-400 font-mono">{parseErrors[0]}</p>
                    </div>
                  )}

                  {/* CSV Format Guide */}
                  <div className="rounded-[16px] bg-[#18191C] border border-[#202126] overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-[#202126]">
                      <span className="text-[10px] font-medium text-[#8A8D96] uppercase tracking-wider">Expected CSV Format</span>
                      <button onClick={handleCopy} className="flex items-center gap-1 text-[10px] font-medium text-[#8A8D96] hover:text-[#FFFFFF] transition-colors cursor-pointer">
                        {copied ? <><Check className="w-3 h-3 text-[#3CD3AD]" /><span className="text-[#3CD3AD]">Copied</span></> : <><Copy className="w-3 h-3" />Copy</>}
                      </button>
                    </div>
                    <pre className="p-4 text-[10px] font-mono text-[#8A8D96] overflow-x-auto leading-relaxed">{CSV_FORMAT}</pre>
                    <div className="px-4 py-3 border-t border-[#202126] space-y-2">
                      <p className="text-[10px] font-medium text-[#8A8D96] uppercase tracking-wider mb-2">Column Reference</p>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-medium px-1.5 py-0.5 bg-[#FF5A4F]/10 border border-[#FF5A4F]/20 text-[#FF5A4F] rounded">required</span>
                          <span className="text-[10px] font-mono text-[#FFFFFF]">{REQUIRED_HEADER}</span>
                        </div>
                        {OPTIONAL_HEADERS.map((h) => (
                          <div key={h} className="flex items-center gap-2">
                            <span className="text-[9px] font-medium px-1.5 py-0.5 bg-[#25262B] border border-[#202126] text-[#8A8D96] rounded">optional</span>
                            <span className="text-[10px] font-mono text-[#8A8D96]">{h}</span>
                          </div>
                        ))}
                      </div>
                      <p className="text-[10px] text-[#8A8D96] font-medium mt-2">
                        <span className="text-[#FFFFFF]">lifecycle_stage</span> values: {LIFECYCLE_VALUES.join(", ")} (default: lead)
                      </p>
                      <p className="text-[10px] text-[#8A8D96] font-medium">
                        Duplicate emails are automatically skipped.
                      </p>
                    </div>
                  </div>
                </>
              )}

              {step === "preview" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 bg-[#18191C] p-3 rounded-[12px] border border-[#202126]">
                    <FileText className="w-4 h-4 text-[#FFB020] shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-[#FFFFFF] truncate">{fileName}</p>
                      <p className="text-[9px] text-[#8A8D96] font-medium mt-0.5">{parsedRows.length} rows ready to import</p>
                    </div>
                  </div>

                  {importError && (
                    <div className="p-3 rounded-[12px] bg-[#FF5A4F]/5 border border-[#FF5A4F]/20 flex items-start gap-2">
                      <AlertCircle className="w-3.5 h-3.5 text-[#FF5A4F] shrink-0 mt-0.5" />
                      <p className="text-[10px] text-[#FF5A4F] font-medium">{importError}</p>
                    </div>
                  )}

                  {/* Preview table */}
                  <div className="rounded-[16px] border border-[#202126] overflow-hidden">
                    <div className="overflow-x-auto max-h-48">
                      <table className="w-full text-[10px]">
                        <thead>
                          <tr className="border-b border-[#202126] bg-[#18191C]">
                            {["email", "first_name", "last_name", "phone", "lifecycle_stage"].map((h) => (
                              <th key={h} className="px-3 py-2 text-left font-medium text-[#8A8D96] whitespace-nowrap">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#202126]">
                          {parsedRows.slice(0, 5).map((row, i) => (
                            <tr key={i} className="hover:bg-[#25262B]">
                              <td className="px-3 py-2 font-medium text-[#FFFFFF]">{row.email}</td>
                              <td className="px-3 py-2 text-[#8A8D96]">{row.first_name || "—"}</td>
                              <td className="px-3 py-2 text-[#8A8D96]">{row.last_name || "—"}</td>
                              <td className="px-3 py-2 font-medium text-[#8A8D96]">{row.phone || "—"}</td>
                              <td className="px-3 py-2 font-medium text-[#8A8D96]">{row.lifecycle_stage || "lead"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {parsedRows.length > 5 && (
                      <div className="px-3 py-2 border-t border-[#202126] text-[9px] font-medium text-[#8A8D96]">
                        +{parsedRows.length - 5} more rows not shown
                      </div>
                    )}
                  </div>
                </div>
              )}

              {step === "loading" && (
                <div className="flex flex-col items-center justify-center text-center py-12 space-y-4">
                  <Loader2 className="w-8 h-8 text-[#696CFF] animate-spin" />
                  <div>
                    <h4 className="text-xs font-semibold text-[#FFFFFF]">Importing {parsedRows.length} contacts...</h4>
                    <p className="text-[9px] text-[#8A8D96] font-medium mt-1">Deduplicating and validating rows</p>
                  </div>
                </div>
              )}

              {step === "result" && (
                <div className="flex flex-col items-center justify-center text-center py-10 space-y-4">
                  <div className="p-3 bg-[#3CD3AD]/10 border border-[#3CD3AD]/25 text-[#3CD3AD] rounded-2xl">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-base font-semibold text-[#FFFFFF]">Import Complete</h4>
                    <p className="text-xs text-[#8A8D96] mt-1.5 leading-relaxed">
                      Imported <span className="text-[#3CD3AD] font-bold font-mono">{importResult.imported}</span> contacts,
                      skipped <span className="text-[#FFB020] font-bold font-mono">{importResult.skipped}</span> duplicates.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-[#202126] bg-[#0D0E12] flex gap-3 shrink-0">
              {step === "upload" && (
                <button onClick={onClose} className="w-full py-2.5 bg-transparent hover:bg-[#25262B] border border-[#202126] hover:border-[#8A8D96] text-xs font-semibold text-[#8A8D96] hover:text-[#FFFFFF] rounded-[12px] transition-all cursor-pointer">
                  Cancel
                </button>
              )}
              {step === "preview" && (
                <>
                  <button onClick={reset} className="flex-1 py-2 bg-transparent hover:bg-[#25262B] border border-[#202126] hover:border-[#8A8D96] text-xs font-semibold text-[#8A8D96] hover:text-[#FFFFFF] rounded-[12px] transition-all cursor-pointer">
                    Back
                  </button>
                  <button onClick={handleImport} className="flex-1 py-2 bg-[#696CFF] hover:bg-[#5A5CE6] text-xs font-semibold text-[#FFFFFF] rounded-[12px] shadow-none transition-all cursor-pointer flex items-center justify-center gap-1.5">
                    Import {parsedRows.length} Contacts <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}
              {step === "result" && (
                <button onClick={handleFinish} className="w-full py-2.5 bg-[#696CFF] hover:bg-[#5A5CE6] text-xs font-semibold text-[#FFFFFF] rounded-[12px] shadow-none transition-colors cursor-pointer">
                  Close & View Contacts
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
