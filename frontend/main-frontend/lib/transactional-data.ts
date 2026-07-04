export type SendStatus = "queued" | "sending" | "sent" | "failed" | "bounced"
export type TemplateStatus = "draft" | "published" | "archived"

export type TemplateVariable = { name: string; type: "string" | "number" | "boolean" }

export type EmailTemplate = {
  id: string
  name: string
  subject: string
  htmlBody: string
  plainText: string
  variables: TemplateVariable[]
  status: TemplateStatus
  version: number
  createdAt: string
  updatedAt: string
}

export type TransactionalSend = {
  id: string
  recipient: string
  recipientName: string
  subject: string
  fromEmail: string
  fromName: string
  replyTo: string
  status: SendStatus
  tags: Record<string, string>
  providerMessageId: string | null
  failureReason: string | null
  idempotencyKey: string | null
  sentAt: string | null
  createdAt: string
  updatedAt: string
}

export const VERIFIED_DOMAINS = ["hello@Mailvex.com", "noreply@Mailvex.com", "outreach@Mailvex.com"]

export const SEND_STATUS_META: Record<SendStatus, { label: string; cls: string; spinner?: boolean }> = {
  queued:  { label: "Queued",  cls: "text-[#8A8D96]" },
  sending: { label: "Sending", cls: "text-[#696CFF]", spinner: true },
  sent:    { label: "Sent",    cls: "text-[#3CD3AD]" },
  failed:  { label: "Failed",  cls: "text-[#FF5A4F]" },
  bounced: { label: "Bounced", cls: "text-[#FFB020]" },
}

export const TEMPLATE_STATUS_META: Record<TemplateStatus, { label: string; cls: string }> = {
  draft:     { label: "Draft",     cls: "text-[#8A8D96]" },
  published: { label: "Published", cls: "text-[#3CD3AD]" },
  archived:  { label: "Archived",  cls: "text-zinc-600 line-through" },
}

const BASE_STYLES = `
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    body { margin:0; padding:0; background:#0F1016; font-family:'Inter',Arial,sans-serif; }
    .wrapper { background:#0F1016; padding:40px 16px; }
    .card { background:#13161F; border:1px solid #1C202C; border-radius:12px; max-width:560px; margin:0 auto; overflow:hidden; }
    .header { background:linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%); padding:36px 40px; text-align:center; }
    .header img { height:32px; margin-bottom:16px; }
    .header h1 { color:#fff; font-size:22px; font-weight:700; margin:0; letter-spacing:-0.3px; }
    .body { padding:36px 40px; }
    .body p { color:#9CA3AF; font-size:15px; line-height:1.7; margin:0 0 18px; }
    .body p strong { color:#E5E7EB; }
    .btn { display:inline-block; background:linear-gradient(135deg,#6366f1,#8b5cf6); color:#fff !important; text-decoration:none; font-size:15px; font-weight:600; padding:13px 32px; border-radius:8px; margin:8px 0 24px; }
    .divider { border:none; border-top:1px solid #1C202C; margin:24px 0; }
    .info-box { background:#0F1016; border:1px solid #1C202C; border-radius:8px; padding:20px 24px; margin:20px 0; }
    .info-row { display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #1C202C; }
    .info-row:last-child { border-bottom:none; }
    .info-label { color:#6B7280; font-size:13px; }
    .info-value { color:#E5E7EB; font-size:13px; font-weight:500; }
    .badge { display:inline-block; background:#6366f1/10; border:1px solid #6366f1/25; color:#818cf8; font-size:12px; padding:3px 10px; border-radius:999px; }
    .footer { padding:24px 40px; border-top:1px solid #1C202C; text-align:center; }
    .footer p { color:#4B5563; font-size:12px; margin:0 0 6px; }
    .footer a { color:#6366f1; text-decoration:none; }
    .highlight { color:#818cf8; font-weight:600; }
    .warn-box { background:#7f1d1d22; border:1px solid #ef444433; border-radius:8px; padding:16px 20px; margin:20px 0; }
    .warn-box p { color:#FCA5A5; margin:0; font-size:14px; }
    .success-icon { font-size:48px; margin-bottom:12px; display:block; }
    .feature-grid { display:flex; gap:16px; flex-wrap:wrap; margin:20px 0; }
    .feature-item { flex:1; min-width:140px; background:#0F1016; border:1px solid #1C202C; border-radius:8px; padding:16px; }
    .feature-item .icon { font-size:24px; margin-bottom:8px; }
    .feature-item h4 { color:#E5E7EB; font-size:13px; font-weight:600; margin:0 0 4px; }
    .feature-item p { color:#6B7280; font-size:12px; margin:0; }
    .stat-row { display:flex; gap:12px; margin:20px 0; }
    .stat-box { flex:1; background:#0F1016; border:1px solid #1C202C; border-radius:8px; padding:16px; text-align:center; }
    .stat-box .num { color:#818cf8; font-size:28px; font-weight:700; display:block; }
    .stat-box .lbl { color:#6B7280; font-size:12px; }
    .progress-bar { background:#1C202C; border-radius:999px; height:6px; margin:8px 0; overflow:hidden; }
    .progress-fill { height:100%; background:linear-gradient(90deg,#6366f1,#8b5cf6); border-radius:999px; }
    .avatar { width:48px; height:48px; border-radius:50%; background:linear-gradient(135deg,#6366f1,#8b5cf6); display:inline-flex; align-items:center; justify-content:center; color:#fff; font-size:18px; font-weight:700; margin-bottom:16px; }
  </style>
`

const FOOTER_HTML = (unsubscribeUrl = "{{unsubscribe_url}}") => `
  <div class="footer">
    <p>© 2026 Mailvex, Inc. · <a href="https://Mailvex.com">Mailvex.com</a></p>
    <p>You're receiving this email because you have an account with Mailvex.</p>
    <p><a href="${unsubscribeUrl}">Unsubscribe</a> · <a href="https://Mailvex.com/privacy">Privacy Policy</a></p>
  </div>
`

export const initialTemplates: EmailTemplate[] = [
  // ─── 1. Welcome Email ────────────────────────────────────────────────────────
  {
    id: "tpl-001",
    name: "Welcome Email",
    subject: "Welcome to Mailvex, {{first_name}}! 🎉",
    htmlBody: `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${BASE_STYLES}</head><body><div class="wrapper"><div class="card">
      <div class="header">
        <div style="font-size:32px;margin-bottom:12px;">🚀</div>
        <h1>Welcome to Mailvex!</h1>
        <p style="color:#c4b5fd;font-size:14px;margin:8px 0 0;">Your customer engagement platform is ready.</p>
      </div>
      <div class="body">
        <p>Hi <strong>{{first_name}}</strong>, great to have you on board!</p>
        <p>Your <strong>{{plan_name}}</strong> workspace is live and ready to use. Here's what you can do next:</p>
        <div class="feature-grid">
          <div class="feature-item"><div class="icon">👥</div><h4>Import Contacts</h4><p>Upload your existing audience in seconds.</p></div>
          <div class="feature-item"><div class="icon">⚡</div><h4>Create Segments</h4><p>Target the right people at the right time.</p></div>
          <div class="feature-item"><div class="icon">📧</div><h4>Send Campaigns</h4><p>Launch email campaigns with one click.</p></div>
        </div>
        <p style="text-align:center;"><a class="btn" href="{{dashboard_url}}">Open Your Dashboard →</a></p>
        <hr class="divider">
        <p>Questions? Reply to this email or visit <a href="https://docs.Mailvex.com" style="color:#818cf8;">our docs</a>. We're here to help.</p>
      </div>
      ${FOOTER_HTML()}
    </div></div></body></html>`,
    plainText: "Welcome to Mailvex, {{first_name}}!\n\nYour {{plan_name}} workspace is ready.\n\nOpen your dashboard: {{dashboard_url}}\n\nNeed help? Visit https://docs.Mailvex.com",
    variables: [
      { name: "first_name", type: "string" },
      { name: "plan_name", type: "string" },
      { name: "dashboard_url", type: "string" },
      { name: "unsubscribe_url", type: "string" },
    ],
    status: "published",
    version: 3,
    createdAt: "2026-04-01T09:00:00Z",
    updatedAt: "2026-06-01T10:00:00Z",
  },

  // ─── 2. Password Reset ───────────────────────────────────────────────────────
  {
    id: "tpl-002",
    name: "Password Reset",
    subject: "Reset your Mailvex password",
    htmlBody: `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${BASE_STYLES}</head><body><div class="wrapper"><div class="card">
      <div class="header" style="background:linear-gradient(135deg,#dc2626 0%,#9333ea 100%);">
        <div style="font-size:32px;margin-bottom:12px;">🔐</div>
        <h1>Password Reset Request</h1>
      </div>
      <div class="body">
        <p>Hi <strong>{{first_name}}</strong>,</p>
        <p>We received a request to reset the password for your Mailvex account associated with <span class="highlight">{{email}}</span>.</p>
        <p style="text-align:center;"><a class="btn" href="{{reset_url}}" style="background:linear-gradient(135deg,#dc2626,#9333ea);">Reset My Password →</a></p>
        <div class="warn-box">
          <p>⏱ This link expires in <strong>{{expiry_hours}} hours</strong>. If you didn't request this, you can safely ignore this email — your password will not change.</p>
        </div>
        <hr class="divider">
        <p style="font-size:13px;color:#6B7280;">For security, this link can only be used once. If you need further help, contact <a href="mailto:support@Mailvex.com" style="color:#818cf8;">support@Mailvex.com</a>.</p>
      </div>
      ${FOOTER_HTML()}
    </div></div></body></html>`,
    plainText: "Hi {{first_name}},\n\nReset your password here: {{reset_url}}\n\nThis link expires in {{expiry_hours}} hours.\n\nIf you didn't request this, ignore this email.",
    variables: [
      { name: "first_name", type: "string" },
      { name: "email", type: "string" },
      { name: "reset_url", type: "string" },
      { name: "expiry_hours", type: "number" },
    ],
    status: "published",
    version: 2,
    createdAt: "2026-04-05T09:00:00Z",
    updatedAt: "2026-05-15T09:00:00Z",
  },

  // ─── 3. Invoice / Receipt ────────────────────────────────────────────────────
  {
    id: "tpl-003",
    name: "Invoice Receipt",
    subject: "Invoice #{{invoice_id}} — ${{amount}} charged",
    htmlBody: `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${BASE_STYLES}</head><body><div class="wrapper"><div class="card">
      <div class="header" style="background:linear-gradient(135deg,#0d9488 0%,#0891b2 100%);">
        <div style="font-size:32px;margin-bottom:12px;">🧾</div>
        <h1>Payment Receipt</h1>
        <p style="color:#99f6e4;font-size:14px;margin:8px 0 0;">Your payment was processed successfully.</p>
      </div>
      <div class="body">
        <p>Hi <strong>{{first_name}}</strong>, thank you for your payment!</p>
        <div class="info-box">
          <div class="info-row"><span class="info-label">Invoice #</span><span class="info-value">{{invoice_id}}</span></div>
          <div class="info-row"><span class="info-label">Plan</span><span class="info-value">{{plan_name}}</span></div>
          <div class="info-row"><span class="info-label">Billing Period</span><span class="info-value">{{billing_period}}</span></div>
          <div class="info-row"><span class="info-label">Payment Method</span><span class="info-value">{{payment_method}}</span></div>
          <div class="info-row" style="margin-top:8px;"><span class="info-label" style="font-weight:700;color:#E5E7EB;">Total Charged</span><span class="info-value" style="font-size:18px;color:#34d399;font-weight:700;">\${{amount}}</span></div>
        </div>
        <p style="text-align:center;"><a class="btn" href="{{invoice_url}}" style="background:linear-gradient(135deg,#0d9488,#0891b2);">View Full Invoice →</a></p>
        <hr class="divider">
        <p style="font-size:13px;color:#6B7280;">Questions about your bill? Contact <a href="mailto:billing@Mailvex.com" style="color:#818cf8;">billing@Mailvex.com</a></p>
      </div>
      ${FOOTER_HTML()}
    </div></div></body></html>`,
    plainText: "Hi {{first_name}},\n\nReceipt for Invoice #{{invoice_id}}\nPlan: {{plan_name}}\nAmount: ${{amount}}\nPeriod: {{billing_period}}\n\nView invoice: {{invoice_url}}",
    variables: [
      { name: "first_name", type: "string" },
      { name: "invoice_id", type: "string" },
      { name: "plan_name", type: "string" },
      { name: "amount", type: "number" },
      { name: "billing_period", type: "string" },
      { name: "payment_method", type: "string" },
      { name: "invoice_url", type: "string" },
    ],
    status: "published",
    version: 2,
    createdAt: "2026-04-10T09:00:00Z",
    updatedAt: "2026-05-20T09:00:00Z",
  },

  // ─── 4. Trial Expiring Soon ──────────────────────────────────────────────────
  {
    id: "tpl-004",
    name: "Trial Expiring Soon",
    subject: "Your Mailvex trial ends in {{days_left}} days",
    htmlBody: `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${BASE_STYLES}</head><body><div class="wrapper"><div class="card">
      <div class="header" style="background:linear-gradient(135deg,#d97706 0%,#dc2626 100%);">
        <div style="font-size:32px;margin-bottom:12px;">⏳</div>
        <h1>Your trial ends soon</h1>
        <p style="color:#fde68a;font-size:14px;margin:8px 0 0;">{{days_left}} days remaining on your free trial.</p>
      </div>
      <div class="body">
        <p>Hi <strong>{{first_name}}</strong>,</p>
        <p>Your free trial of Mailvex expires on <strong>{{expiry_date}}</strong>. Don't lose access to the tools you've been using — upgrade now to continue without interruption.</p>
        <div class="info-box">
          <p style="color:#E5E7EB;font-weight:600;margin:0 0 12px;font-size:14px;">What you've built so far:</p>
          <div class="info-row"><span class="info-label">Contacts imported</span><span class="info-value highlight">{{contact_count}}</span></div>
          <div class="info-row"><span class="info-label">Campaigns sent</span><span class="info-value highlight">{{campaign_count}}</span></div>
          <div class="info-row"><span class="info-label">Segments created</span><span class="info-value highlight">{{segment_count}}</span></div>
        </div>
        <p style="text-align:center;"><a class="btn" href="{{upgrade_url}}" style="background:linear-gradient(135deg,#d97706,#dc2626);">Upgrade Now →</a></p>
        <p style="font-size:13px;color:#6B7280;text-align:center;">Plans start at just $29/month. No contracts, cancel anytime.</p>
      </div>
      ${FOOTER_HTML()}
    </div></div></body></html>`,
    plainText: "Hi {{first_name}},\n\nYour Mailvex trial expires on {{expiry_date}} ({{days_left}} days left).\n\nUpgrade now: {{upgrade_url}}\n\nPlans start at $29/month.",
    variables: [
      { name: "first_name", type: "string" },
      { name: "days_left", type: "number" },
      { name: "expiry_date", type: "string" },
      { name: "contact_count", type: "number" },
      { name: "campaign_count", type: "number" },
      { name: "segment_count", type: "number" },
      { name: "upgrade_url", type: "string" },
    ],
    status: "published",
    version: 1,
    createdAt: "2026-04-15T09:00:00Z",
    updatedAt: "2026-04-15T09:00:00Z",
  },

  // ─── 5. Email Verification ───────────────────────────────────────────────────
  {
    id: "tpl-005",
    name: "Email Verification",
    subject: "Verify your email address",
    htmlBody: `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${BASE_STYLES}</head><body><div class="wrapper"><div class="card">
      <div class="header">
        <div style="font-size:32px;margin-bottom:12px;">✉️</div>
        <h1>Confirm your email</h1>
      </div>
      <div class="body">
        <p>Hi <strong>{{first_name}}</strong>,</p>
        <p>Thanks for signing up for Mailvex. Please verify your email address to activate your account and start engaging your audience.</p>
        <p style="text-align:center;"><a class="btn" href="{{verify_url}}">Verify Email Address →</a></p>
        <div class="info-box" style="text-align:center;">
          <p style="color:#6B7280;font-size:13px;margin:0 0 8px;">Or copy and paste this link into your browser:</p>
          <p style="color:#818cf8;font-size:12px;word-break:break-all;margin:0;">{{verify_url}}</p>
        </div>
        <div class="warn-box">
          <p>⏱ This verification link expires in <strong>24 hours</strong>.</p>
        </div>
        <p style="font-size:13px;color:#6B7280;">If you didn't create an Mailvex account, please ignore this email.</p>
      </div>
      ${FOOTER_HTML()}
    </div></div></body></html>`,
    plainText: "Hi {{first_name}},\n\nVerify your email address to activate your Mailvex account:\n{{verify_url}}\n\nThis link expires in 24 hours.",
    variables: [
      { name: "first_name", type: "string" },
      { name: "verify_url", type: "string" },
    ],
    status: "published",
    version: 1,
    createdAt: "2026-04-20T09:00:00Z",
    updatedAt: "2026-04-20T09:00:00Z",
  },

  // ─── 6. Team Invitation ──────────────────────────────────────────────────────
  {
    id: "tpl-006",
    name: "Team Invitation",
    subject: "{{inviter_name}} invited you to join {{workspace_name}} on Mailvex",
    htmlBody: `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${BASE_STYLES}</head><body><div class="wrapper"><div class="card">
      <div class="header" style="background:linear-gradient(135deg,#7c3aed 0%,#2563eb 100%);">
        <div style="font-size:32px;margin-bottom:12px;">🤝</div>
        <h1>You're invited!</h1>
        <p style="color:#ddd6fe;font-size:14px;margin:8px 0 0;">Join your team on Mailvex.</p>
      </div>
      <div class="body">
        <p><strong>{{inviter_name}}</strong> has invited you to collaborate on the <span class="highlight">{{workspace_name}}</span> workspace on Mailvex.</p>
        <div class="info-box">
          <div class="info-row"><span class="info-label">Workspace</span><span class="info-value">{{workspace_name}}</span></div>
          <div class="info-row"><span class="info-label">Your Role</span><span class="info-value"><span class="badge">{{role}}</span></span></div>
          <div class="info-row"><span class="info-label">Invited by</span><span class="info-value">{{inviter_name}}</span></div>
          <div class="info-row"><span class="info-label">Invite expires</span><span class="info-value">{{expires_at}}</span></div>
        </div>
        <p style="text-align:center;"><a class="btn" href="{{invite_url}}" style="background:linear-gradient(135deg,#7c3aed,#2563eb);">Accept Invitation →</a></p>
        <p style="font-size:13px;color:#6B7280;text-align:center;">By accepting, you agree to Mailvex's <a href="https://Mailvex.com/terms" style="color:#818cf8;">Terms of Service</a>.</p>
      </div>
      ${FOOTER_HTML()}
    </div></div></body></html>`,
    plainText: "{{inviter_name}} invited you to join {{workspace_name}} on Mailvex.\n\nYour role: {{role}}\nExpires: {{expires_at}}\n\nAccept invitation: {{invite_url}}",
    variables: [
      { name: "inviter_name", type: "string" },
      { name: "workspace_name", type: "string" },
      { name: "role", type: "string" },
      { name: "expires_at", type: "string" },
      { name: "invite_url", type: "string" },
    ],
    status: "published",
    version: 1,
    createdAt: "2026-04-25T09:00:00Z",
    updatedAt: "2026-04-25T09:00:00Z",
  },

  // ─── 7. New Feature Announcement ─────────────────────────────────────────────
  {
    id: "tpl-007",
    name: "Feature Announcement",
    subject: "✨ Introducing {{feature_name}} — now live on Mailvex",
    htmlBody: `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${BASE_STYLES}</head><body><div class="wrapper"><div class="card">
      <div class="header" style="background:linear-gradient(135deg,#0f766e 0%,#6366f1 100%);">
        <div style="font-size:32px;margin-bottom:12px;">✨</div>
        <h1>{{feature_name}} is here</h1>
        <p style="color:#99f6e4;font-size:14px;margin:8px 0 0;">A powerful new addition to your workspace.</p>
      </div>
      <div class="body">
        <p>Hi <strong>{{first_name}}</strong>,</p>
        <p>We've just launched <strong>{{feature_name}}</strong> — one of our most-requested features. Here's what it means for you:</p>
        <div class="feature-grid">
          <div class="feature-item"><div class="icon">⚡</div><h4>{{benefit_1_title}}</h4><p>{{benefit_1_desc}}</p></div>
          <div class="feature-item"><div class="icon">🎯</div><h4>{{benefit_2_title}}</h4><p>{{benefit_2_desc}}</p></div>
        </div>
        <p>{{feature_description}}</p>
        <p style="text-align:center;"><a class="btn" href="{{feature_url}}" style="background:linear-gradient(135deg,#0f766e,#6366f1);">Try {{feature_name}} Now →</a></p>
        <hr class="divider">
        <p style="font-size:13px;color:#6B7280;">Read the <a href="{{docs_url}}" style="color:#818cf8;">full documentation</a> or watch our <a href="{{video_url}}" style="color:#818cf8;">quick walkthrough video</a>.</p>
      </div>
      ${FOOTER_HTML()}
    </div></div></body></html>`,
    plainText: "Hi {{first_name}},\n\nIntroducing {{feature_name}} on Mailvex!\n\n{{feature_description}}\n\nTry it now: {{feature_url}}\nDocs: {{docs_url}}",
    variables: [
      { name: "first_name", type: "string" },
      { name: "feature_name", type: "string" },
      { name: "feature_description", type: "string" },
      { name: "benefit_1_title", type: "string" },
      { name: "benefit_1_desc", type: "string" },
      { name: "benefit_2_title", type: "string" },
      { name: "benefit_2_desc", type: "string" },
      { name: "feature_url", type: "string" },
      { name: "docs_url", type: "string" },
      { name: "video_url", type: "string" },
    ],
    status: "published",
    version: 1,
    createdAt: "2026-05-01T09:00:00Z",
    updatedAt: "2026-05-01T09:00:00Z",
  },

  // ─── 8. Account Suspended ────────────────────────────────────────────────────
  {
    id: "tpl-008",
    name: "Account Suspended",
    subject: "⚠️ Your Mailvex account has been suspended",
    htmlBody: `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${BASE_STYLES}</head><body><div class="wrapper"><div class="card">
      <div class="header" style="background:linear-gradient(135deg,#b91c1c 0%,#7f1d1d 100%);">
        <div style="font-size:32px;margin-bottom:12px;">⚠️</div>
        <h1>Account Suspended</h1>
      </div>
      <div class="body">
        <p>Hi <strong>{{first_name}}</strong>,</p>
        <p>Your Mailvex account (<span class="highlight">{{email}}</span>) has been suspended due to the following reason:</p>
        <div class="warn-box">
          <p><strong>Reason:</strong> {{suspension_reason}}</p>
        </div>
        <p>Your data is safe and will be retained for <strong>{{retention_days}} days</strong>. To restore access, please resolve the issue and contact our support team.</p>
        <div class="info-box">
          <div class="info-row"><span class="info-label">Suspended on</span><span class="info-value">{{suspension_date}}</span></div>
          <div class="info-row"><span class="info-label">Data retained until</span><span class="info-value">{{retention_until}}</span></div>
          <div class="info-row"><span class="info-label">Workspace</span><span class="info-value">{{workspace_name}}</span></div>
        </div>
        <p style="text-align:center;"><a class="btn" href="{{appeal_url}}" style="background:linear-gradient(135deg,#b91c1c,#7f1d1d);">Contact Support →</a></p>
        <p style="font-size:13px;color:#6B7280;text-align:center;">Reply to this email or visit <a href="https://Mailvex.com/support" style="color:#818cf8;">Mailvex.com/support</a></p>
      </div>
      ${FOOTER_HTML()}
    </div></div></body></html>`,
    plainText: "Hi {{first_name}},\n\nYour Mailvex account ({{email}}) has been suspended.\n\nReason: {{suspension_reason}}\nData retained until: {{retention_until}}\n\nContact support: {{appeal_url}}",
    variables: [
      { name: "first_name", type: "string" },
      { name: "email", type: "string" },
      { name: "suspension_reason", type: "string" },
      { name: "suspension_date", type: "string" },
      { name: "retention_days", type: "number" },
      { name: "retention_until", type: "string" },
      { name: "workspace_name", type: "string" },
      { name: "appeal_url", type: "string" },
    ],
    status: "published",
    version: 1,
    createdAt: "2026-05-05T09:00:00Z",
    updatedAt: "2026-05-05T09:00:00Z",
  },

  // ─── 9. Upgrade / Plan Confirmation ─────────────────────────────────────────
  {
    id: "tpl-009",
    name: "Plan Upgrade Confirmation",
    subject: "You're now on the {{new_plan}} plan 🎉",
    htmlBody: `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${BASE_STYLES}</head><body><div class="wrapper"><div class="card">
      <div class="header" style="background:linear-gradient(135deg,#059669 0%,#0891b2 100%);">
        <div style="font-size:32px;margin-bottom:12px;">🎉</div>
        <h1>Plan Upgrade Confirmed!</h1>
        <p style="color:#a7f3d0;font-size:14px;margin:8px 0 0;">Welcome to {{new_plan}}.</p>
      </div>
      <div class="body">
        <p>Hi <strong>{{first_name}}</strong>,</p>
        <p>You've successfully upgraded from <strong>{{old_plan}}</strong> to the <strong>{{new_plan}}</strong> plan. Your new limits are active immediately.</p>
        <div class="stat-row">
          <div class="stat-box"><span class="num">{{contact_limit}}</span><span class="lbl">Contacts</span></div>
          <div class="stat-box"><span class="num">{{email_limit}}</span><span class="lbl">Emails/mo</span></div>
          <div class="stat-box"><span class="num">{{seat_limit}}</span><span class="lbl">Team seats</span></div>
        </div>
        <div class="info-box">
          <div class="info-row"><span class="info-label">New plan</span><span class="info-value"><span class="badge">{{new_plan}}</span></span></div>
          <div class="info-row"><span class="info-label">Next billing date</span><span class="info-value">{{next_billing_date}}</span></div>
          <div class="info-row"><span class="info-label">Monthly charge</span><span class="info-value" style="color:#34d399;font-weight:700;">\${{monthly_amount}}</span></div>
        </div>
        <p style="text-align:center;"><a class="btn" href="{{dashboard_url}}" style="background:linear-gradient(135deg,#059669,#0891b2);">Explore New Features →</a></p>
      </div>
      ${FOOTER_HTML()}
    </div></div></body></html>`,
    plainText: "Hi {{first_name}},\n\nYou've upgraded to the {{new_plan}} plan on Mailvex!\n\nNext billing: {{next_billing_date}} · ${{monthly_amount}}/mo\n\nDashboard: {{dashboard_url}}",
    variables: [
      { name: "first_name", type: "string" },
      { name: "old_plan", type: "string" },
      { name: "new_plan", type: "string" },
      { name: "contact_limit", type: "string" },
      { name: "email_limit", type: "string" },
      { name: "seat_limit", type: "string" },
      { name: "next_billing_date", type: "string" },
      { name: "monthly_amount", type: "number" },
      { name: "dashboard_url", type: "string" },
    ],
    status: "published",
    version: 1,
    createdAt: "2026-05-10T09:00:00Z",
    updatedAt: "2026-05-10T09:00:00Z",
  },

  // ─── 10. Monthly Performance Report ──────────────────────────────────────────
  {
    id: "tpl-010",
    name: "Monthly Performance Report",
    subject: "Your {{month}} report is ready — {{open_rate}}% open rate",
    htmlBody: `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${BASE_STYLES}</head><body><div class="wrapper"><div class="card">
      <div class="header" style="background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%);">
        <div style="font-size:32px;margin-bottom:12px;">📊</div>
        <h1>{{month}} Performance Report</h1>
        <p style="color:#c4b5fd;font-size:14px;margin:8px 0 0;">{{workspace_name}} · Generated {{report_date}}</p>
      </div>
      <div class="body">
        <p>Hi <strong>{{first_name}}</strong>, here's a snapshot of how your workspace performed in <strong>{{month}}</strong>.</p>
        <div class="stat-row">
          <div class="stat-box"><span class="num">{{emails_sent}}</span><span class="lbl">Emails Sent</span></div>
          <div class="stat-box"><span class="num">{{open_rate}}%</span><span class="lbl">Open Rate</span></div>
          <div class="stat-box"><span class="num">{{click_rate}}%</span><span class="lbl">Click Rate</span></div>
        </div>
        <div class="info-box">
          <p style="color:#E5E7EB;font-weight:600;font-size:14px;margin:0 0 16px;">Deliverability Breakdown</p>
          <div style="margin-bottom:12px;">
            <div style="display:flex;justify-content:space-between;margin-bottom:4px;"><span style="color:#9CA3AF;font-size:13px;">Delivered</span><span style="color:#34d399;font-size:13px;font-weight:600;">{{delivered_rate}}%</span></div>
            <div class="progress-bar"><div class="progress-fill" style="width:{{delivered_rate}}%"></div></div>
          </div>
          <div style="margin-bottom:12px;">
            <div style="display:flex;justify-content:space-between;margin-bottom:4px;"><span style="color:#9CA3AF;font-size:13px;">Bounced</span><span style="color:#f87171;font-size:13px;font-weight:600;">{{bounce_rate}}%</span></div>
            <div class="progress-bar"><div class="progress-fill" style="width:{{bounce_rate}}%;background:linear-gradient(90deg,#dc2626,#f87171);"></div></div>
          </div>
          <div class="info-row" style="margin-top:12px;"><span class="info-label">New contacts this month</span><span class="info-value highlight">+{{new_contacts}}</span></div>
          <div class="info-row"><span class="info-label">Unsubscribes</span><span class="info-value">{{unsubscribes}}</span></div>
          <div class="info-row"><span class="info-label">Top campaign</span><span class="info-value">{{top_campaign}}</span></div>
        </div>
        <p style="text-align:center;"><a class="btn" href="{{report_url}}">View Full Report →</a></p>
        <hr class="divider">
        <p style="font-size:13px;color:#6B7280;text-align:center;">Reports are generated on the 1st of each month. <a href="{{settings_url}}" style="color:#818cf8;">Manage report settings</a></p>
      </div>
      ${FOOTER_HTML()}
    </div></div></body></html>`,
    plainText: "Hi {{first_name}},\n\n{{month}} Performance Report for {{workspace_name}}:\n\nEmails sent: {{emails_sent}}\nOpen rate: {{open_rate}}%\nClick rate: {{click_rate}}%\nNew contacts: +{{new_contacts}}\n\nFull report: {{report_url}}",
    variables: [
      { name: "first_name", type: "string" },
      { name: "workspace_name", type: "string" },
      { name: "month", type: "string" },
      { name: "report_date", type: "string" },
      { name: "emails_sent", type: "number" },
      { name: "open_rate", type: "number" },
      { name: "click_rate", type: "number" },
      { name: "delivered_rate", type: "number" },
      { name: "bounce_rate", type: "number" },
      { name: "new_contacts", type: "number" },
      { name: "unsubscribes", type: "number" },
      { name: "top_campaign", type: "string" },
      { name: "report_url", type: "string" },
      { name: "settings_url", type: "string" },
    ],
    status: "published",
    version: 1,
    createdAt: "2026-05-15T09:00:00Z",
    updatedAt: "2026-05-15T09:00:00Z",
  },
]

export const initialSends: TransactionalSend[] = [
  {
    id: "snd-001",
    recipient: "alice@acme.com",
    recipientName: "Alice Johnson",
    subject: "Welcome to Mailvex, Alice!",
    fromEmail: "hello@Mailvex.com",
    fromName: "Mailvex Team",
    replyTo: "",
    status: "sent",
    tags: { source: "signup", template: "welcome" },
    providerMessageId: "0102018f1234abcd-abc123",
    failureReason: null,
    idempotencyKey: "signup-alice-001",
    sentAt: "2026-05-25T10:05:00Z",
    createdAt: "2026-05-25T10:04:00Z",
    updatedAt: "2026-05-25T10:05:00Z",
  },
  {
    id: "snd-002",
    recipient: "bob@techcorp.io",
    recipientName: "Bob Smith",
    subject: "Reset your password",
    fromEmail: "noreply@Mailvex.com",
    fromName: "Mailvex",
    replyTo: "support@Mailvex.com",
    status: "failed",
    tags: { source: "password-reset" },
    providerMessageId: null,
    failureReason: "SENDER_DOMAIN_NOT_VERIFIED: Domain verification failed",
    idempotencyKey: null,
    sentAt: null,
    createdAt: "2026-05-25T11:00:00Z",
    updatedAt: "2026-05-25T11:01:00Z",
  },
  {
    id: "snd-003",
    recipient: "carol@startup.co",
    recipientName: "Carol Williams",
    subject: "Your invoice #INV-2026-042 is ready",
    fromEmail: "hello@Mailvex.com",
    fromName: "Mailvex Team",
    replyTo: "",
    status: "bounced",
    tags: { source: "billing" },
    providerMessageId: "0102018f5678efgh",
    failureReason: "550 5.1.1 The email account does not exist",
    idempotencyKey: null,
    sentAt: "2026-05-24T09:00:00Z",
    createdAt: "2026-05-24T08:59:00Z",
    updatedAt: "2026-05-24T09:02:00Z",
  },
  {
    id: "snd-004",
    recipient: "dave@enterprise.com",
    recipientName: "Dave Brown",
    subject: "Welcome to Mailvex, Dave!",
    fromEmail: "hello@Mailvex.com",
    fromName: "Mailvex Team",
    replyTo: "",
    status: "sending",
    tags: { source: "signup" },
    providerMessageId: null,
    failureReason: null,
    idempotencyKey: "signup-dave-004",
    sentAt: null,
    createdAt: "2026-05-26T14:00:00Z",
    updatedAt: "2026-05-26T14:00:00Z",
  },
  {
    id: "snd-005",
    recipient: "eve@agency.net",
    recipientName: "Eve Davis",
    subject: "Reset your password",
    fromEmail: "noreply@Mailvex.com",
    fromName: "Mailvex",
    replyTo: "",
    status: "queued",
    tags: { source: "password-reset" },
    providerMessageId: null,
    failureReason: null,
    idempotencyKey: null,
    sentAt: null,
    createdAt: "2026-05-26T14:30:00Z",
    updatedAt: "2026-05-26T14:30:00Z",
  },
]
