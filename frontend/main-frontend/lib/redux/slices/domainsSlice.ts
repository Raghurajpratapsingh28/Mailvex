import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { domainsService, type ApiDomain } from '@/lib/domains-service';

interface DomainsFilters {
  status: string;
}

interface DomainsState {
  items: ApiDomain[];
  total: number;
  filters: DomainsFilters;
  loading: boolean;
  error: string | null;
  workspaceId: string | null;
  fetchedAt: number | null;
}

const initialState: DomainsState = {
  items: [],
  total: 0,
  filters: { status: 'all' },
  loading: false,
  error: null,
  workspaceId: null,
  fetchedAt: null,
};

export const fetchDomains = createAsyncThunk(
  'domains/fetchDomains',
  async ({ workspaceId, filters }: { workspaceId: string; filters: DomainsFilters }) => {
    const res = await domainsService.list(workspaceId, {
      pageSize: 100,
      status: filters.status !== 'all' ? filters.status : undefined,
    });
    return { items: res.items, total: res.total, workspaceId };
  }
);

const domainsSlice = createSlice({
  name: 'domains',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<DomainsFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    addDomain: (state, action: PayloadAction<ApiDomain>) => {
      state.items.unshift(action.payload);
      state.total += 1;
    },
    patchDomain: (state, action: PayloadAction<Partial<ApiDomain> & { id: string }>) => {
      const idx = state.items.findIndex((d) => d.id === action.payload.id);
      if (idx !== -1) {
        state.items[idx] = { ...state.items[idx], ...action.payload };
      }
    },
    removeDomain: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((d) => d.id !== action.payload);
      state.total = Math.max(0, state.total - 1);
    },
    clearDomains: (state) => {
      state.items = [];
      state.total = 0;
      state.workspaceId = null;
      state.error = null;
      state.filters = initialState.filters;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDomains.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDomains.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.total = action.payload.total;
        state.workspaceId = action.payload.workspaceId;
        state.fetchedAt = Date.now();
      })
      .addCase(fetchDomains.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load domains';
      });
  },
});

export const { setFilters, addDomain, patchDomain, removeDomain, clearDomains } = domainsSlice.actions;
export default domainsSlice.reducer;
