// src/lib/axios.ts
import axios from "axios";

const api = axios.create({
  baseURL: "https://client.api.skaleapps.io/api/v-2",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
  },
});

export default api;
