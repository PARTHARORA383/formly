import api from "@/lib/axios"

class AuthApi {
  static magicLink(email: string) {
    return api.post("/auth/magic-link", { email })
  }

  static verify(token: string) {
    return api.post("/auth/verify", { token })
  }

  static refresh() {
    return api.post("/auth/refresh")
  }

  static logout() {
    return api.post("/auth/logout")
  }

  static me() {
    return api.get("/auth/me")
  }
}

export default AuthApi
