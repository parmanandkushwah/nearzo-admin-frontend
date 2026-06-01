import { createSlice } from '@reduxjs/toolkit';

const themeSlice = createSlice({
  name: 'theme',
  initialState: {
    theme: localStorage.getItem('theme') || 'light'
  },
  reducers: {
    toggleTheme: (state, action) => {
      state.theme = action.payload;
      localStorage.setItem('theme', action.payload);
    }
  }
});

export const { toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;