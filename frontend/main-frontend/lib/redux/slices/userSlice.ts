import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService, User } from '@/lib/auth-service';

interface UserState {
  profile: User | null;
  loading: boolean;
  error: string | null;
  fetchedAt: number | null;
}

const initialState: UserState = {
  profile: null,
  loading: false,
  error: null,
  fetchedAt: null,
};

export const fetchUserProfile = createAsyncThunk('user/fetchProfile', async () => {
  return await authService.getMe();
});

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserProfile: (state, action) => {
      state.profile = action.payload;
    },
    clearUserProfile: (state) => {
      state.profile = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
        state.fetchedAt = Date.now();
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch user profile';
      });
  },
});

export const { setUserProfile, clearUserProfile } = userSlice.actions;
export default userSlice.reducer;
