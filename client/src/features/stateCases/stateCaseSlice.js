import { createSlice } from '@reduxjs/toolkit'

// First, define the reducer and action creators via `createSlice`
export const stateCasesSlice = createSlice({
  name: 'stateCases',
  initialState: {
    loading: 'idle',
    stateCases: [],
  },
  reducers: {
    stateCasesLoading(state, action) {
      // Use a "state machine" approach for loading state instead of booleans
      if (state.loading === 'idle') {
        state.loading = 'pending'
      }
    },
    stateCasesReceived(state, action) {
      if (state.loading === 'pending') {
        state.loading = 'idle'
        state.stateCases = action.payload
      }
    },
  },
})

// Destructure and export the plain action creators
export const { stateCasesLoading, stateCasesReceived } = stateCasesSlice.actions

// Define a thunk that dispatches those action creators
export const fetchStateCases= () => async (dispatch) => {
  dispatch(stateCasesLoading())
  const stateCasesUrl = 'api/stateCase'
  const response = await fetch(stateCasesUrl, {})
  dispatch(stateCasesReceived(response.data))
}