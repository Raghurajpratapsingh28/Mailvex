"use client"

import { Toaster as Sonner } from "sonner"

export function Toaster() {
  return (
    <Sonner
      position="bottom-right"
      expand={false}
      richColors={false}
      closeButton
      toastOptions={{
        classNames: {
          toast:
            "group !bg-[#111318] !border !border-white/[0.08] !text-white !rounded-2xl !shadow-2xl !shadow-black/60 !px-4 !py-3.5 !gap-3 !font-sans !text-sm",
          title: "!text-white !font-semibold !text-[13px] !leading-snug",
          description: "!text-[#7A8499] !text-[12px] !leading-relaxed",
          icon: "!mt-0.5",
          closeButton:
            "!bg-white/[0.06] !border-white/[0.08] !text-[#7A8499] hover:!text-white hover:!bg-white/[0.12] !rounded-lg !transition-all",
          success:
            "!border-emerald-500/20 [&>[data-icon]]:!text-emerald-400",
          error:
            "!border-red-500/20 [&>[data-icon]]:!text-red-400",
          warning:
            "!border-amber-500/20 [&>[data-icon]]:!text-amber-400",
          info:
            "!border-zinc-500/20 [&>[data-icon]]:!text-zinc-400",
          actionButton:
            "!bg-white/[0.08] !text-white !text-[11px] !font-semibold !rounded-lg !px-3 !py-1.5 hover:!bg-white/[0.14] !transition-all",
          cancelButton:
            "!bg-transparent !text-[#7A8499] !text-[11px] hover:!text-white !transition-all",
        },
      }}
    />
  )
}
