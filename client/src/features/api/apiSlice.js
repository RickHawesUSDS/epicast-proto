// Need to use the React-specific entry point to allow generating React hooks
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

// Define a service using a base URL and expected endpoints
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['StateCase'],
  endpoints: (builder) => ({
    resetSystem: builder.mutation({
      query: () => ({
        url: 'system/reset',
        method: 'POST',
        body: ""
      }),
      invalidatesTags: ['StateCase']
    }),
    getAllStateCases: builder.query({
      query: (sort) => `stateCases?sort=${sort}`,
      providesTags: ['StateCase']
    }),
    addRandomStateCases: builder.mutation({
      query: ({numOfDays, numPerDay}) => ({
        url: `stateCases/random?numOfDays=${numOfDays}&numPerDay=${numPerDay}`,
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
  useResetSystemMutation,
  useGetAllStateCasesQuery,
  useAddRandomStateCasesMutation,
} = apiSlice
