import type { FormField } from "@/types/field"
import type { FormFontId } from "@/lib/form-fonts"

/** What is kept in forms.settings (a JSON column). */
type FormSettings = {
  fontFamily?: FormFontId
}

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
type FormWithFields = Form & { settings?: FormSettings; fields: FormField[] }

/** What GET /public/forms/:publicId returns: only what a respondent needs. */
type PublicForm = {
  publicId: string
  title: string
  description: string | null
  /** The viewer is the owner looking at a form that is not published. */
  preview: boolean
  /** Only the settings a respondent's page needs. */
  settings: { fontFamily?: string }
  fields: (Omit<FormField, "tempId" | "config" | "id"> & { id: number })[]
}

/** What PUT /form/:publicId returns: the form plus its fields with real ids. */
type SavedForm = Form & { fields: SavedField[] }

type SavedField = {
  id: number
  tempId?: string
  options: { id: number; label: string }[]
}

type FormStatus = "draft" | "published" | "closed"

export type { Form, FormSettings, FormStatus, FormWithFields, PublicForm, SavedForm, SavedField }
