import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { loginService } from '../../services/authService';

interface AuthState {
  username: string | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  username: null,
  token: null,
  loading: false,
  error: null,
};

// Async thunk
export const loginAsync = createAsyncThunk<
  { username: string; token?: string }, // return type
  { username: string; password: string }, // argument type
  { rejectValue: string } // reject type
>(
  'auth/loginAsync',
  async ({ username, password }, { rejectWithValue }) => {
    try {

      
      const response = await loginService(username, password);
      
      return response; // { username, token? }
    } catch (err: any) {
      return rejectWithValue(err?.message || 'Login failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.username = null;
      state.token = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.username = action.payload.username;
        state.token = action.payload.token ?? null;
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = typeof action.payload === 'string' ? action.payload : 'Login failed';
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
