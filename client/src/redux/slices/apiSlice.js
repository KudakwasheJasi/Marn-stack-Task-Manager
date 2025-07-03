import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from '../config';

const API_URI = `${API_URL}/api`;

const baseQuery = fetchBaseQuery({ baseUrl: API_URI });

export const apiSlice = createApi({
  baseQuery,
  tagTypes: [],
  endpoints: (builder) => ({}),
});
