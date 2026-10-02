"use client"

import { useEffect, useRef } from "react"
import { useForm } from "@/lib/query/form"
import useFields from "@/lib/zustand/form"
import { readDraft } from "@/hooks/use-form-draft"

export function useLoadForm(publicId: string) {
  const query = useForm(publicId)
  const loaded = useRef(false)

  useEffect(() => {
    if (loaded.current || !query.data) return
    loaded.current = true

    if (readDraft(publicId)) return

    useFields.getState().loadForm({
      title: query.data.title,
      description: query.data.description ?? "",
      fields: query.data.fields.map((field) => ({
        id: field.id,
        type: field.type,
        label: field.label,
        description: field.description,
        placeholder: field.placeholder,
        required: field.required,
        position: field.position,
        config: field.config,
        ...(field.options ? { options: field.options } : {}),
      })),
    })
  }, [query.data, publicId])

  return query
}
