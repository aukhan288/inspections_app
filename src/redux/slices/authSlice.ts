import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { loginService } from '../../services/authService';

interface AuthState {
  username: string | null;
  password: string | null; // optional, can remove later
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  username: null,
  password: null,
  loading: false,
  error: null,
};

// Async thunk to call loginService
export const loginAsync = createAsyncThunk(
  'auth/loginAsync',
  async (
    { username, password }: { username: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      console.log(username, password)
      const response = await loginService(username, password);
       console.log(response)
      return response; // { username, token? }
    } catch (err: any) {
      return rejectWithValue(err || 'Login failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.username = null;
      state.password = null;
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
        state.password = null; // clear password for security
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
