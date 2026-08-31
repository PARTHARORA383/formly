import api from "@/lib/axios"

class AuthApi {
  static magicLink(email: string) {
    return api.post("/auth/magic-link", { email })
  }
}

export default AuthApi
