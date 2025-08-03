/// <reference types="vite/client" />
import axios from "axios"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001"
const USE_BACKEND = import.meta.env.VITE_USE_BACKEND === "true"

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
})

// Only set up interceptors if using backend
if (USE_BACKEND) {
  api.interceptors.request.use(
    (config) => {
      console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`)
      return config
    },
    (error) => {
      return Promise.reject(error)
    },
  )

  api.interceptors.response.use(
    (response) => {
      return response
    },
    (error) => {
      console.error("API Error:", error.response?.data || error.message)
      return Promise.reject(error)
    },
  )
} else {
  console.log("🔗 1inch Integration: Using direct API calls")
}

export default api