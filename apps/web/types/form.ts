import type { FormField } from "@/types/field"

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

/** What GET /form/:publicId returns: the form plus its live fields, in order. */
type FormWithFields = Form & { fields: FormField[] }

/** What PUT /form/:publicId returns: the form plus its fields with real ids. */
type SavedForm = Form & { fields: SavedField[] }

type SavedField = {
  id: number
  tempId?: string
  options: { id: number; label: string }[]
}

type FormStatus = "draft" | "published" | "closed"

export type { Form, FormStatus, FormWithFields, SavedForm, SavedField }
