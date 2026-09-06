import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios"

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
})

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean }

// While a refresh is already in flight, every other 401 waits on this
// instead of firing its own /auth/refresh call.
let refreshPromise: Promise<void> | null = null

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableConfig | undefined

    const isUnauthorized = error.response?.status === 401
    const isRefreshCall = originalRequest?.url === "/auth/refresh"
    const alreadyRetried = originalRequest?._retry

    if (!isUnauthorized || isRefreshCall || alreadyRetried || !originalRequest) {
      return Promise.reject(error)
    }

    originalRequest._retry = true

    try {
      if (!refreshPromise) {
        refreshPromise = api.post("/auth/refresh").then(() => undefined)
      }
      await refreshPromise
    } catch (refreshError) {
      // Refresh token is invalid/expired too — give up, let the caller
      // (or a global handler) redirect to /login.
      return Promise.reject(refreshError)
    } finally {
      refreshPromise = null
    }

    return api(originalRequest)
  }
)

export default api
