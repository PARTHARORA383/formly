"use client"

import * as React from "react"
import type { FormField } from "@/types/field"
import { FIELD_TYPES, defaultOptions, type FieldType } from "@/utils/constants"

// Saved fields have an id, unsaved ones only a tempId. One string covers both
// so selection works before and after the first save.
function fieldKey(field: FormField) {
  return String(field.id ?? field.tempId)
}

type FormDraftValue = {
  fields: FormField[]
  selectedKey: string | null
  selectedField: FormField | null
  addField: (type?: FieldType) => void
  selectField: (key: string) => void
  updateField: (key: string, patch: Partial<FormField>) => void
  changeFieldType: (key: string, type: FieldType) => void
}

const FormDraftContext = React.createContext<FormDraftValue | null>(null)

function FormDraftProvider({ children }: { children: React.ReactNode }) {
  const [fields, setFields] = React.useState<FormField[]>([])
  const [selectedKey, setSelectedKey] = React.useState<string | null>(null)

  const addField = React.useCallback((type: FieldType = "short_text") => {
    const field: FormField = {
      tempId: `tmp_${crypto.randomUUID()}`,
      type,
      label: "Untitled question",
      required: false,
      position: 0,
      config: {},
      // A choice question with no options would render empty.
      ...(FIELD_TYPES[type].hasOptions ? { options: defaultOptions() } : {}),
    }

    setFields((current) => [...current, { ...field, position: current.length }])
    setSelectedKey(fieldKey(field))
  }, [])

  const updateField = React.useCallback(
    (key: string, patch: Partial<FormField>) => {
      setFields((current) =>
        current.map((field) =>
          fieldKey(field) === key ? { ...field, ...patch } : field
        )
      )
    },
    []
  )

  // The id stays the same while the type changes on purpose. The server reads
  // "existing id, different type" as a replaced question: it archives the old
  // row and inserts a new one, so earlier answers stay attached to the old type.
  const changeFieldType = React.useCallback((key: string, type: FieldType) => {
    setFields((current) =>
      current.map((field) => {
        if (fieldKey(field) !== key) return field

        const { options, ...rest } = field

        if (!FIELD_TYPES[type].hasOptions) {
          // Options on a non-choice field would be sent to the server as-is.
          return { ...rest, type }
        }

        return { ...rest, type, options: options?.length ? options : defaultOptions() }
      })
    )
  }, [])

  const selectedField =
    fields.find((field) => fieldKey(field) === selectedKey) ?? null

  const value = React.useMemo(
    () => ({
      fields,
      selectedKey,
      selectedField,
      addField,
      selectField: setSelectedKey,
      updateField,
      changeFieldType,
    }),
    [fields, selectedKey, selectedField, addField, updateField, changeFieldType]
  )

  return <FormDraftContext.Provider value={value}>{children}</FormDraftContext.Provider>
}

function useFormDraft() {
  const context = React.useContext(FormDraftContext)

  if (!context) {
    throw new Error("useFormDraft must be used within a FormDraftProvider")
  }

  return context
}

export { FormDraftProvider, useFormDraft, fieldKey }
