import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { transactionalService, type EmailSend, type EmailTemplate } from '@/lib/transactional-service';
import type { TransactionalSend, EmailTemplate as LocalEmailTemplate } from '@/lib/transactional-data';
import { initialTemplates } from '@/lib/transactional-data';

function mapSend(s: EmailSend): TransactionalSend {
  return {
    id: s.sendId, recipient: s.recipientEmail, recipientName: s.recipientEmail.split('@')[0],
    subject: s.subject, fromEmail: s.senderEmail, fromName: '', replyTo: '',
    status: s.status, tags: s.tags, providerMessageId: s.providerMessageId,
    failureReason: s.failureReason, idempotencyKey: null, sentAt: null,
    createdAt: s.createdAt, updatedAt: s.updatedAt,
  };
}

function mapTemplate(t: EmailTemplate): LocalEmailTemplate {
  return {
    id: t.id, name: t.name, subject: t.subject, htmlBody: t.htmlBody, plainText: t.textBody,
    variables: Object.entries(t.variables || {}).map(([name]) => ({ name, type: 'string' as const })),
    status: t.status, version: t.version, createdAt: t.createdAt, updatedAt: t.updatedAt,
  };
}

interface SendsFilters {
  recipient: string;
  status: string;
  dateFrom: string;
  dateTo: string;
}

interface TemplatesFilters {
  search: string;
  status: string;
  latestOnly: boolean;
}

interface TransactionalState {
  sends: TransactionalSend[];
  sendsTotal: number;
  sendsFilters: SendsFilters;
  sendsLoading: boolean;
  sendsFetchedAt: number | null;

  templates: LocalEmailTemplate[];
  templatesTotal: number;
  templatesFilters: TemplatesFilters;
  templatesLoading: boolean;
  templatesFetchedAt: number | null;

  workspaceId: string | null;
}

const initialState: TransactionalState = {
  sends: [],
  sendsTotal: 0,
  sendsFilters: { recipient: '', status: 'all', dateFrom: '', dateTo: '' },
  sendsLoading: false,
  sendsFetchedAt: null,

  templates: [],
  templatesTotal: 0,
  templatesFilters: { search: '', status: 'all', latestOnly: true },
  templatesLoading: false,
  templatesFetchedAt: null,

  workspaceId: null,
};

export const fetchSends = createAsyncThunk(
  'transactional/fetchSends',
  async ({ workspaceId, filters }: { workspaceId: string; filters: SendsFilters }) => {
    const res = await transactionalService.getSends(workspaceId, {
      status: filters.status !== 'all' ? filters.status : undefined,
      recipient: filters.recipient || undefined,
      fromDate: filters.dateFrom || undefined,
      toDate: filters.dateTo || undefined,
      pageSize: 100,
    });
    return { items: res.items.map(mapSend), total: res.total, workspaceId };
  }
);

export const fetchTemplates = createAsyncThunk(
  'transactional/fetchTemplates',
  async ({ workspaceId, filters }: { workspaceId: string; filters: TemplatesFilters }) => {
    const res = await transactionalService.getTemplates(workspaceId, {
      status: filters.status !== 'all' ? filters.status : undefined,
      search: filters.search || undefined,
      latestOnly: filters.latestOnly,
      pageSize: 100,
    });
    const mapped = res.items.map(mapTemplate);
    return {
      items: mapped.length === 0 ? initialTemplates : mapped,
      total: mapped.length === 0 ? initialTemplates.length : res.total,
      workspaceId,
    };
  }
);

const transactionalSlice = createSlice({
  name: 'transactional',
  initialState,
  reducers: {
    setSendsFilters: (state, action: PayloadAction<Partial<SendsFilters>>) => {
      state.sendsFilters = { ...state.sendsFilters, ...action.payload };
    },
    setTemplatesFilters: (state, action: PayloadAction<Partial<TemplatesFilters>>) => {
      state.templatesFilters = { ...state.templatesFilters, ...action.payload };
    },
    patchTemplate: (state, action: PayloadAction<Partial<LocalEmailTemplate> & { id: string }>) => {
      const idx = state.templates.findIndex((t) => t.id === action.payload.id);
      if (idx !== -1) {
        state.templates[idx] = { ...state.templates[idx], ...action.payload };
      }
    },
    removeTemplate: (state, action: PayloadAction<string>) => {
      state.templates = state.templates.filter((t) => t.id !== action.payload);
      state.templatesTotal = Math.max(0, state.templatesTotal - 1);
    },
    clearTransactional: (state) => {
      Object.assign(state, initialState);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSends.pending, (state) => { state.sendsLoading = true; })
      .addCase(fetchSends.fulfilled, (state, action) => {
        state.sendsLoading = false;
        state.sends = action.payload.items;
        state.sendsTotal = action.payload.total;
        state.workspaceId = action.payload.workspaceId;
        state.sendsFetchedAt = Date.now();
      })
      .addCase(fetchSends.rejected, (state) => { state.sendsLoading = false; })

      .addCase(fetchTemplates.pending, (state) => { state.templatesLoading = true; })
      .addCase(fetchTemplates.fulfilled, (state, action) => {
        state.templatesLoading = false;
        state.templates = action.payload.items;
        state.templatesTotal = action.payload.total;
        state.workspaceId = action.payload.workspaceId;
        state.templatesFetchedAt = Date.now();
      })
      .addCase(fetchTemplates.rejected, (state) => {
        state.templatesLoading = false;
        state.templates = initialTemplates;
        state.templatesTotal = initialTemplates.length;
      });
  },
});

export const { setSendsFilters, setTemplatesFilters, patchTemplate, removeTemplate, clearTransactional } = transactionalSlice.actions;
export { mapSend, mapTemplate };
export default transactionalSlice.reducer;
