import type { Invoice } from "@/lib/billing-service"
import { ExternalLink, Download } from "lucide-react"

const STATUS_META: Record<string, { label: string; cls: string }> = {
  paid:   { label: "Paid",  cls: "bg-emerald-500/10 border-emerald-500/25 text-emerald-400" },
  open:   { label: "Open",  cls: "bg-amber-500/10 border-amber-500/25 text-amber-400" },
  void:   { label: "Void",  cls: "bg-zinc-500/10 border-zinc-500/25 text-zinc-400" },
  draft:  { label: "Draft", cls: "bg-zinc-500/10 border-zinc-500/25 text-zinc-400" },
}

export default function InvoicesTable({ invoices }: { invoices: Invoice[] }) {
  return (
    <div className="p-6 rounded-[16px] bg-[#18191C] border border-[#202126]">
      <h3 className="text-xs font-semibold text-[#FFFFFF]/80 tracking-tight border-b border-[#202126]/60 pb-4 mb-4">
        Invoices
      </h3>
      {invoices.length === 0 ? (
        <p className="text-xs text-[#8A8D96] font-medium uppercase tracking-wider">No invoices yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-[12px] border border-[#202126]">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#202126]">
                {["Date", "Amount", "Status", "Actions"].map((col) => (
                  <th key={col} className="px-4 py-3 text-left text-xs font-semibold text-[#FFFFFF]/80 tracking-tight whitespace-nowrap">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1C202C]/60">
              {invoices.map((inv) => {
                const meta = STATUS_META[inv.status] ?? STATUS_META.draft
                const date = inv.createdAt
                  ? new Date(inv.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                  : "—"
                const amount = ((inv.amountPaid ?? inv.amountDue ?? 0) / 100).toFixed(2)
                return (
                  <tr key={inv.id} className="hover:bg-[#18191C] transition-colors">
                    <td className="px-4 py-3 text-[#8A8D96] font-medium uppercase tracking-wider whitespace-nowrap">{date}</td>
                    <td className="px-4 py-3 font-semibold text-[#FFFFFF]/90">${amount}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[9px] font-semibold px-2 py-0.5 border rounded-full uppercase ${meta.cls}`}>{meta.label}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {inv.hostedInvoiceUrl && (
                          <a href={inv.hostedInvoiceUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#18191C] hover:bg-[#25262B] border border-[#202126] hover:border-[#696CFF] text-[9px] font-medium uppercase tracking-wider text-[#8A8D96] hover:text-[#FFFFFF] transition-all">
                            <ExternalLink className="w-3 h-3" /> View
                          </a>
                        )}
                        {inv.pdfUrl && (
                          <a href={inv.pdfUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#18191C] hover:bg-[#25262B] border border-[#202126] hover:border-[#696CFF] text-[9px] font-medium uppercase tracking-wider text-[#8A8D96] hover:text-[#FFFFFF] transition-all">
                            <Download className="w-3 h-3" /> PDF
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
