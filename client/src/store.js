import { configureStore } from '@reduxjs/toolkit'

import { stateCasesSlice } from './features/stateCases/stateCaseSlice'

export default configureStore({
  reducer: {
    stateCases: stateCasesSlice.reducer
  }
})
