import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

interface Inspection {
  id: number;
  name: string;
}

interface InspectionState {
  inspections: Inspection[];
  loading: boolean;
  error: string | null;
}

const initialState: InspectionState = {
  inspections: [],
  loading: false,
  error: null,
};

// Async thunk to fetch inspections
export const fetchInspections = createAsyncThunk(
  'inspection/fetchInspections',
  async (token: string, { rejectWithValue }) => {
    try {
      const response = await fetch(
        'https://inspections.compliantretrofits.co.uk/api/inspections',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || 'Failed to fetch inspections');
      }

      return (await response.json()).inspections as Inspection[];
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

const inspectionSlice = createSlice({
  name: 'inspection',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchInspections.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInspections.fulfilled, (state, action) => {
        state.loading = false;
        state.inspections = action.payload;
      })
      .addCase(fetchInspections.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default inspectionSlice.reducer;
