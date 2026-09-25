import api from "@/lib/axios"
import type { CreateFormInput } from "@/lib/zod/form"

class FormApi {
  static create(input: CreateFormInput) {
    return api.post("/form/create", input)
  }

  static list() {
    return api.get("/form")
  }
}

export default FormApi
