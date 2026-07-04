import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { workspaceService, Workspace, WorkspaceSettings, WorkspaceMember } from '@/lib/workspace-service';

interface WorkspaceState {
  workspaces: Array<{ workspace: Workspace; role: string }> | null;
  currentWorkspace: Workspace | null;
  settings: WorkspaceSettings | null;
  members: WorkspaceMember[] | null;
  loading: boolean;
  error: string | null;
  fetchedAt: number | null;
}

const initialState: WorkspaceState = {
  workspaces: null,
  currentWorkspace: null,
  settings: null,
  members: null,
  loading: false,
  error: null,
  fetchedAt: null,
};

export const fetchWorkspaces = createAsyncThunk('workspace/fetchWorkspaces', async () => {
  const response = await workspaceService.getWorkspaces();
  return response.items;
});

export const fetchCurrentWorkspace = createAsyncThunk('workspace/fetchCurrent', async (workspaceId: string) => {
  const response = await workspaceService.getCurrentWorkspace(workspaceId);
  return response.workspace;
});

export const fetchWorkspaceSettings = createAsyncThunk('workspace/fetchSettings', async (workspaceId: string) => {
  const response = await workspaceService.getSettings(workspaceId);
  return response.settings;
});

export const fetchWorkspaceMembers = createAsyncThunk('workspace/fetchMembers', async (workspaceId: string) => {
  const response = await workspaceService.getMembers(workspaceId);
  return response.items;
});

const workspaceSlice = createSlice({
  name: 'workspace',
  initialState,
  reducers: {
    clearWorkspaceData: (state) => {
      state.workspaces = null;
      state.currentWorkspace = null;
      state.settings = null;
      state.members = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWorkspaces.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWorkspaces.fulfilled, (state, action) => {
        state.loading = false;
        state.workspaces = action.payload;
        state.fetchedAt = Date.now();
      })
      .addCase(fetchWorkspaces.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch workspaces';
      })
      .addCase(fetchCurrentWorkspace.fulfilled, (state, action) => {
        state.currentWorkspace = action.payload;
      })
      .addCase(fetchWorkspaceSettings.fulfilled, (state, action) => {
        state.settings = action.payload;
      })
      .addCase(fetchWorkspaceMembers.fulfilled, (state, action) => {
        state.members = action.payload;
      });
  },
});

export const { clearWorkspaceData } = workspaceSlice.actions;
export default workspaceSlice.reducer;
