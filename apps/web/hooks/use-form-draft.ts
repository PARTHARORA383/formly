"use client"

import { useEffect } from "react"
import useFields from "@/lib/zustand/form"
import { getStored, removeStored, setStored } from "@/utils/storage"
import type { Fields } from "@/types/field"

export type Draft = { title: string; description: string; fields: Fields }

// Drafts saved before the title existed are a bare array of questions.
export function readDraft(publicId: string): Draft | null {
  const stored = getStored<Draft | Fields>(draftKey(publicId))

  if (Array.isArray(stored)) return { title: "", description: "", fields: stored }
  if (stored && Array.isArray(stored.fields)) return stored
  return null
}

const SAVE_DELAY_MS = 300

export const draftKey = (publicId: string) => `formly:draft:${publicId}`

// A clear is deferred by one tick. React's dev-mode strict check unmounts and
// remounts every effect straight away, which would otherwise wipe a draft that
// was only just restored. A real remount cancels the pending clear.
let pendingClear: ReturnType<typeof setTimeout> | null = null

/**
 * Keeps the builder's questions in localStorage while the page is open, so a
 * reload doesn't lose work that hasn't been saved. Leaving the page discards
 * the draft: the storage entry is removed and the store is reset.
 */
export function useFormDraft(publicId: string) {
  useEffect(() => {
    if (pendingClear) {
      clearTimeout(pendingClear)
      pendingClear = null
    }

    const key = draftKey(publicId)
    // A draft with no questions still counts: it means they were all removed.
    const draft = readDraft(publicId)
    if (draft) {
      const store = useFields.getState()
      store.loadForm(draft)
    }

    let timer: ReturnType<typeof setTimeout> | null = null
    const write = () => {
      const { title, description, fields } = useFields.getState()
      setStored(key, { title, description, fields } satisfies Draft)
    }

    // Debounced, so typing in a label doesn't write on every keystroke.
    const unsubscribe = useFields.subscribe((state, previous) => {
      if (
        state.fields === previous.fields &&
        state.title === previous.title &&
        state.description === previous.description
      ) {
        return
      }
      if (timer) clearTimeout(timer)
      timer = setTimeout(write, SAVE_DELAY_MS)
    })

    // A reload inside the debounce window would lose the last edit.
    const flush = () => {
      if (timer) {
        clearTimeout(timer)
        timer = null
        write()
      }
    }
    window.addEventListener("pagehide", flush)

    return () => {
      window.removeEventListener("pagehide", flush)
      unsubscribe()
      if (timer) clearTimeout(timer)

      pendingClear = setTimeout(() => {
        removeStored(key)
        useFields.getState().reset()
        pendingClear = null
      }, 0)
    }
  }, [publicId])
}
