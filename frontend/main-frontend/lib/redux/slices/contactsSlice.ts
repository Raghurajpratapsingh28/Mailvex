import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { contactsService, Contact } from '@/lib/contacts-service';

interface ContactsFilters {
  search: string;
  lifecycleStage: string;
  tags: string[];
  showSuppressed: boolean;
  showUnsubscribed: boolean;
  dateFrom: string;
  dateTo: string;
  page: number;
}

interface ContactsState {
  items: Contact[];
  total: number;
  filters: ContactsFilters;
  loading: boolean;
  error: string | null;
  workspaceId: string | null;
  fetchedAt: number | null;
}

const initialState: ContactsState = {
  items: [],
  total: 0,
  filters: {
    search: '',
    lifecycleStage: 'all',
    tags: [],
    showSuppressed: false,
    showUnsubscribed: false,
    dateFrom: '',
    dateTo: '',
    page: 1,
  },
  loading: false,
  error: null,
  workspaceId: null,
  fetchedAt: null,
};

export const fetchContacts = createAsyncThunk(
  'contacts/fetchContacts',
  async ({ workspaceId, filters }: { workspaceId: string; filters: ContactsFilters }) => {
    const res = await contactsService.getContacts(workspaceId, {
      page: filters.page,
      pageSize: 50,
      search: filters.search || undefined,
      lifecycleStage: filters.lifecycleStage !== 'all' ? filters.lifecycleStage : undefined,
      tags: filters.tags.length > 0 ? filters.tags.join(',') : undefined,
      emailSuppressed: filters.showSuppressed || undefined,
      unsubscribed: filters.showUnsubscribed || undefined,
      fromDate: filters.dateFrom || undefined,
      toDate: filters.dateTo || undefined,
    });
    return { items: res.items, total: res.total, workspaceId };
  }
);

const contactsSlice = createSlice({
  name: 'contacts',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<ContactsFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
      if (!('page' in action.payload)) {
        state.filters.page = 1;
      }
    },
    patchContact: (state, action: PayloadAction<Partial<Contact> & { id: string }>) => {
      const idx = state.items.findIndex((c) => c.id === action.payload.id);
      if (idx !== -1) {
        state.items[idx] = { ...state.items[idx], ...action.payload };
      }
    },
    removeContact: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((c) => c.id !== action.payload);
      state.total = Math.max(0, state.total - 1);
    },
    clearContacts: (state) => {
      state.items = [];
      state.total = 0;
      state.workspaceId = null;
      state.error = null;
      state.filters = initialState.filters;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchContacts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchContacts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items as Contact[];
        state.total = action.payload.total;
        state.workspaceId = action.payload.workspaceId;
        state.fetchedAt = Date.now();
      })
      .addCase(fetchContacts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load contacts';
      });
  },
});

export const { setFilters, patchContact, removeContact, clearContacts } = contactsSlice.actions;
export default contactsSlice.reducer;
