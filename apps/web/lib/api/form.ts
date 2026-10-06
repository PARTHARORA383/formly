import api from "@/lib/axios"
import type { CreateFormInput, SubmitFormInput, UpdateFormInput } from "@/lib/zod/form"

class FormApi {
  static create(input: CreateFormInput) {
    return api.post("/form/create", input)
  }

  static update(publicId: string, input: UpdateFormInput) {
    return api.put(`/form/${publicId}`, input)
  }

  static get(publicId: string) {
    return api.get(`/form/${publicId}`)
  }

  // Public: no login, so it must not depend on a session.
  static getPublic(publicId: string) {
    return api.get(`/public/forms/${publicId}`)
  }

  // Public: a respondent is not logged in.
  static submit(input: SubmitFormInput) {
    return api.post("/form/submit", input)
  }

  static list() {
    return api.get("/form")
  }
}

export default FormApi
