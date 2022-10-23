// Need to use the React-specific entry point to allow generating React hooks
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

// Define a service using a base URL and expected endpoints
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['StateCase', 'StateCaseSchema', 'CDCCase', 'CDCCaseSchema'],
  endpoints: (builder) => ({

    resetSystem: builder.mutation({
      query: () => ({
        url: 'system/reset',
        method: 'POST',
        body: ''
      }),
      invalidatesTags: ['StateCase', 'CDCCase', 'CDCCaseSchema', 'CDCCaseSubscriber', 'StateCaseSchema']
    }),

    getAllStateCases: builder.query({
      query: (sort) => `stateCases?sort=${sort}`,
      providesTags: ['StateCase']
    }),

    getStateCaseSchema: builder.query({
      query: () => 'stateCases/schema',
      providesTags: ['StateCaseSchema']
    }),

    addRandomStateCases: builder.mutation({
      query: ({ numOfDays, numPerDay }) => ({
        url: `stateCases/random?numOfDays=${numOfDays}&numPerDay=${numPerDay}`,
        method: 'POST',
        body: ''
      }),
      invalidatesTags: ['StateCase']
    }),

    publishStateCases: builder.mutation({
      query: () => ({
        url: 'stateCases/publish',
        method: 'POST',
        body: ''
      }),
      invalidatesTags: []
    }),

    getAllCDCCases: builder.query({
      query: (sort) => `cdcCases?sort=${sort}`,
      providesTags: ['CDCCase']
    }),

    getCDCCaseSchema: builder.query({
      query: () => 'cdcCases/schema',
      providesTags: ['CDCCaseSchema']
    }),

    getCDCCaseSubscriber: builder.query({
      query: () => 'cdcCases/subscriber',
      polling: 1000,
      providesTags: ['CDCCaseSubscriber']
    }),

    readCDCCaseFeed: builder.mutation({
      query: () => ({
        url: 'cdcCases/subscriber/once',
        method: 'POST',
        body: ''
      }),
      invalidatesTags: ['CDCCase', 'CDCCaseSchema']
    })
  })
})

// Export hooks for usage in function components, which are
// auto-generated based on the defined endpoints
export const {
  useResetSystemMutation,
  useGetAllStateCasesQuery,
  useAddRandomStateCasesMutation,
  usePublishStateCasesMutation,
  useGetStateCaseSchemaQuery,
  useGetAllCDCCasesQuery,
  useGetCDCCaseSchemaQuery,
  useReadCDCCaseFeedMutation,
  useGetCDCCaseSubscriberQuery
} = apiSlice
