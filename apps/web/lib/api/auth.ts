import api from "@/lib/axios"

class AuthApi {
  static magicLink(email: string) {
    return api.post("/auth/magic-link", { email })
  }

  static verify(token: string) {
    return api.post("/auth/verify", { token })
  }
}

export default AuthApi
