// Need to use the React-specific entry point to allow generating React hooks
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

// Define a service using a base URL and expected endpoints
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['StateCase'],
  endpoints: (builder) => ({
    getStateCases: builder.query({
      query: () => `stateCases`,
      providesTags: ['StateCase']
    }),
    resetSystem: builder.mutation({
      query: () => ({
        url: 'system/reset',
        method: 'POST',
        body: ""
      }),
      invalidatesTags: ['StateCase']
    }),
  }),
})

// Export hooks for usage in function components, which are
// auto-generated based on the defined endpoints
export const {
  useGetStateCasesQuery,
  useResetSystemMutation
} = apiSlice
