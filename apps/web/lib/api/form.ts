import api from "@/lib/axios"
import type { CreateFormInput, UpdateFormInput } from "@/lib/zod/form"

class FormApi {
  static create(input: CreateFormInput) {
    return api.post("/form/create", input)
  }

  static update(publicId: string, input: UpdateFormInput) {
    return api.put(`/form/${publicId}`, input)
  }

  static list() {
    return api.get("/form")
  }
}

export default FormApi
