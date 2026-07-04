import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { campaignsService } from '@/lib/campaigns-service';
import type { Campaign } from '@/lib/campaigns-data';

interface CampaignsFilters {
  search: string;
  status: string;
  dateFrom: string;
  dateTo: string;
  page: number;
}

interface CampaignsState {
  items: Campaign[];
  total: number;
  filters: CampaignsFilters;
  loading: boolean;
  error: string | null;
  workspaceId: string | null;
  fetchedAt: number | null;
}

const initialState: CampaignsState = {
  items: [],
  total: 0,
  filters: { search: '', status: 'all', dateFrom: '', dateTo: '', page: 1 },
  loading: false,
  error: null,
  workspaceId: null,
  fetchedAt: null,
};

export const fetchCampaigns = createAsyncThunk(
  'campaigns/fetchCampaigns',
  async ({ workspaceId, filters }: { workspaceId: string; filters: CampaignsFilters }) => {
    const res = await campaignsService.list(workspaceId, {
      page: filters.page,
      pageSize: 50,
      status: filters.status !== 'all' ? filters.status : undefined,
      search: filters.search || undefined,
      fromDate: filters.dateFrom || undefined,
      toDate: filters.dateTo || undefined,
    });
    return { items: res.items, total: res.total, workspaceId };
  }
);

const campaignsSlice = createSlice({
  name: 'campaigns',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<CampaignsFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
      // reset to page 1 when any filter (not page) changes
      if (!('page' in action.payload)) {
        state.filters.page = 1;
      }
    },
    patchCampaign: (state, action: PayloadAction<Partial<Campaign> & { id: string }>) => {
      const idx = state.items.findIndex((c) => c.id === action.payload.id);
      if (idx !== -1) {
        state.items[idx] = { ...state.items[idx], ...action.payload };
      }
    },
    removeCampaign: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((c) => c.id !== action.payload);
      state.total = Math.max(0, state.total - 1);
    },
    clearCampaigns: (state) => {
      state.items = [];
      state.total = 0;
      state.workspaceId = null;
      state.error = null;
      state.filters = initialState.filters;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCampaigns.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCampaigns.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.total = action.payload.total;
        state.workspaceId = action.payload.workspaceId;
        state.fetchedAt = Date.now();
      })
      .addCase(fetchCampaigns.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load campaigns';
      });
  },
});

export const { setFilters, patchCampaign, removeCampaign, clearCampaigns } = campaignsSlice.actions;
export default campaignsSlice.reducer;
