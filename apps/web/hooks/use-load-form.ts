"use client"

import { useEffect, useRef } from "react"
import { useForm } from "@/lib/query/form"
import useFields from "@/lib/zustand/form"
import { getStored } from "@/utils/storage"
import { draftKey } from "@/hooks/use-form-draft"
import type { Fields } from "@/types/field"

/**
 * Loads the form from the server and puts its questions into the store, once.
 *
 * It must only run once: a later refetch (after a save, say) would otherwise
 * overwrite whatever has been typed since. A draft in localStorage takes
 * priority, because it holds edits the server has not seen.
 */
export function useLoadForm(publicId: string) {
  const query = useForm(publicId)
  const loaded = useRef(false)

  useEffect(() => {
    if (loaded.current || !query.data) return
    loaded.current = true

    if (Array.isArray(getStored<Fields>(draftKey(publicId)))) return

    // Pick only what the builder uses, so server-only columns such as
    // createdAt are not carried into the next save.
    useFields.getState().setFields(
      query.data.fields.map((field) => ({
        id: field.id,
        type: field.type,
        label: field.label,
        description: field.description,
        placeholder: field.placeholder,
        required: field.required,
        position: field.position,
        config: field.config,
        ...(field.options ? { options: field.options } : {}),
      }))
    )
  }, [query.data, publicId])

  return query
}
