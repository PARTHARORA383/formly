/** A form as the API returns it. Mirrors the forms table. */
type Form = {
  id: number
  publicId: string
  title: string
  description: string | null
  status: FormStatus
  createdAt: string
  updatedAt: string
}

type FormStatus = "draft" | "published" | "closed"

export type { Form, FormStatus }
