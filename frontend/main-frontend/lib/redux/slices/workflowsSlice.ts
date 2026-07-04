import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { workflowsService, type ApiWorkflow } from '@/lib/workflows-service';
import { graphToNodes, type Workflow } from '@/lib/workflows-data';

function apiToWorkflow(w: ApiWorkflow): Workflow {
  return {
    id: w.id,
    name: w.name,
    status: w.status,
    nodes: w.graph ? graphToNodes(w.graph) : [],
    executionStats: w.executionStats ?? { total: 0, completed: 0, failed: 0, running: 0 },
    publishedAt: w.publishedAt,
    createdAt: w.createdAt,
    updatedAt: w.updatedAt,
  };
}

interface WorkflowsState {
  items: Workflow[];
  total: number;
  loading: boolean;
  error: string | null;
  workspaceId: string | null;
  fetchedAt: number | null;
}

const initialState: WorkflowsState = {
  items: [],
  total: 0,
  loading: false,
  error: null,
  workspaceId: null,
  fetchedAt: null,
};

export const fetchWorkflows = createAsyncThunk(
  'workflows/fetchWorkflows',
  async (workspaceId: string) => {
    const res = await workflowsService.list(workspaceId, { pageSize: 100 });
    return { items: res.items.map(apiToWorkflow), total: res.total, workspaceId };
  }
);

const workflowsSlice = createSlice({
  name: 'workflows',
  initialState,
  reducers: {
    patchWorkflow: (state, action: PayloadAction<Partial<Workflow> & { id: string }>) => {
      const idx = state.items.findIndex((w) => w.id === action.payload.id);
      if (idx !== -1) {
        state.items[idx] = { ...state.items[idx], ...action.payload };
      }
    },
    addWorkflow: (state, action: PayloadAction<Workflow>) => {
      state.items.unshift(action.payload);
      state.total += 1;
    },
    removeWorkflow: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((w) => w.id !== action.payload);
      state.total = Math.max(0, state.total - 1);
    },
    clearWorkflows: (state) => {
      state.items = [];
      state.total = 0;
      state.workspaceId = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWorkflows.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWorkflows.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.total = action.payload.total;
        state.workspaceId = action.payload.workspaceId;
        state.fetchedAt = Date.now();
      })
      .addCase(fetchWorkflows.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load workflows';
      });
  },
});

export const { patchWorkflow, addWorkflow, removeWorkflow, clearWorkflows } = workflowsSlice.actions;
export { apiToWorkflow };
export default workflowsSlice.reducer;
