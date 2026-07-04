import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { segmentsService } from '@/lib/segments-service';
import type { Segment } from '@/lib/segments-data';

type PreviewContact = { id: string; email: string; firstName: string; lastName: string; lifecycleStage: string };

interface SegmentsState {
  items: Segment[];
  total: number;
  filterType: 'all' | 'static' | 'dynamic';
  selectedSegment: Segment | null;
  previewContacts: PreviewContact[];
  loading: boolean;
  error: string | null;
  workspaceId: string | null;
  fetchedAt: number | null;
}

const initialState: SegmentsState = {
  items: [],
  total: 0,
  filterType: 'all',
  selectedSegment: null,
  previewContacts: [],
  loading: false,
  error: null,
  workspaceId: null,
  fetchedAt: null,
};

export const fetchSegments = createAsyncThunk(
  'segments/fetchSegments',
  async (workspaceId: string) => {
    const res = await segmentsService.listSegments(workspaceId, { pageSize: 100 });
    return { items: res.items, total: res.total, workspaceId };
  }
);

export const fetchSegmentPreview = createAsyncThunk(
  'segments/fetchPreview',
  async ({ workspaceId, segmentId }: { workspaceId: string; segmentId: string }) => {
    const res = await segmentsService.previewSegment(workspaceId, segmentId);
    return res.contacts;
  }
);

const segmentsSlice = createSlice({
  name: 'segments',
  initialState,
  reducers: {
    setFilterType: (state, action: PayloadAction<'all' | 'static' | 'dynamic'>) => {
      state.filterType = action.payload;
    },
    setSelectedSegment: (state, action: PayloadAction<Segment | null>) => {
      state.selectedSegment = action.payload;
      state.previewContacts = [];
    },
    patchSegment: (state, action: PayloadAction<Partial<Segment> & { id: string }>) => {
      const idx = state.items.findIndex((s) => s.id === action.payload.id);
      if (idx !== -1) {
        state.items[idx] = { ...state.items[idx], ...action.payload };
      }
      if (state.selectedSegment?.id === action.payload.id) {
        state.selectedSegment = { ...state.selectedSegment, ...action.payload };
      }
    },
    addSegment: (state, action: PayloadAction<Segment>) => {
      state.items.unshift(action.payload);
      state.total += 1;
    },
    removeSegment: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((s) => s.id !== action.payload);
      state.total = Math.max(0, state.total - 1);
      if (state.selectedSegment?.id === action.payload) {
        state.selectedSegment = null;
      }
    },
    updatePreviewContacts: (state, action: PayloadAction<{ contacts: PreviewContact[]; delta: number }>) => {
      state.previewContacts = action.payload.contacts;
      if (state.selectedSegment) {
        state.selectedSegment = {
          ...state.selectedSegment,
          contactCount: state.selectedSegment.contactCount + action.payload.delta,
        };
        const idx = state.items.findIndex((s) => s.id === state.selectedSegment!.id);
        if (idx !== -1) {
          state.items[idx] = { ...state.items[idx], contactCount: state.items[idx].contactCount + action.payload.delta };
        }
      }
    },
    clearSegments: (state) => {
      state.items = [];
      state.total = 0;
      state.selectedSegment = null;
      state.previewContacts = [];
      state.workspaceId = null;
      state.error = null;
      state.filterType = 'all';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSegments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSegments.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.total = action.payload.total;
        state.workspaceId = action.payload.workspaceId;
        state.fetchedAt = Date.now();
      })
      .addCase(fetchSegments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load segments';
      })
      .addCase(fetchSegmentPreview.fulfilled, (state, action) => {
        state.previewContacts = action.payload;
      });
  },
});

export const {
  setFilterType,
  setSelectedSegment,
  patchSegment,
  addSegment,
  removeSegment,
  updatePreviewContacts,
  clearSegments,
} = segmentsSlice.actions;
export default segmentsSlice.reducer;
