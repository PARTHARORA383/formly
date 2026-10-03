import { create } from 'zustand'
import type { Fields, FormField } from '@/types/field'
import type { FormSettings, SavedField } from '@/types/form'
import { FIELD_TYPES, defaultOptions, type FieldType } from '@/utils/constants'

// Fields created in the builder keep their tempId after the first save, and
// the key prefers it, so saving (which only adds the real id) never changes a
// field's key. That keeps the selection and React's identity for the card.
// Fields that arrived from the server have no tempId and fall back to the id.
export function fieldKey(field: FormField) {
    return field.tempId ?? String(field.id)
}

type FieldsStore = {
    title: string
    description: string
    settings: FormSettings
    fields: Fields
    selectedKey: string | null
    addField: (type?: FieldType, index?: number) => void
    removeField: (key: string) => void
    setFields: (fields: Fields) => void
    setTitle: (title: string) => void
    setDescription: (description: string) => void
    setSettings: (patch: Partial<FormSettings>) => void
    loadForm: (form: { title: string; description: string; settings: FormSettings; fields: Fields }) => void
    applySaved: (saved: SavedField[]) => void
    moveField: (fromKey: string, toKey: string) => void
    selectField: (key: string) => void
    updateField: (key: string, patch: Partial<FormField>) => void
    changeFieldType: (key: string, type: FieldType) => void
    reset: () => void
}

const useFields = create<FieldsStore>((set) => ({
    title: "",
    description: "",
    settings: {},
    fields: [],
    selectedKey: null,

    // index inserts at that spot (a drop between questions); omitted appends.
    addField: (type = "short_text", index) =>
        set((state) => {
            const at = Math.min(Math.max(index ?? state.fields.length, 0), state.fields.length)
            const field: FormField = {
                tempId: `tmp_${crypto.randomUUID()}`,
                type,
                label: "",
                required: false,
                position: at,
                config: {},
                // A choice question with no options would render empty.
                ...(FIELD_TYPES[type].hasOptions ? { options: defaultOptions() } : {}),
            }

            const fields = [...state.fields]
            fields.splice(at, 0, field)

            // position follows the array index, so it is renumbered after an insert.
            return {
                fields: fields.map((item, position) => ({ ...item, position })),
                selectedKey: fieldKey(field),
            }
        }),

    // Moves a question to where another one currently sits, pushing the rest along.
    moveField: (fromKey, toKey) =>
        set((state) => {
            const from = state.fields.findIndex((field) => fieldKey(field) === fromKey)
            const to = state.fields.findIndex((field) => fieldKey(field) === toKey)
            if (from === -1 || to === -1 || from === to) return state

            const fields = [...state.fields]
            const [moved] = fields.splice(from, 1)
            fields.splice(to, 0, moved!)

            return { fields: fields.map((field, position) => ({ ...field, position })) }
        }),

    // Replaces the whole list, e.g. when restoring an older draft.
    setFields: (fields) => set({ fields, selectedKey: null }),

    setTitle: (title) => set({ title }),
    setDescription: (description) => set({ description }),
    setSettings: (patch) => set((state) => ({ settings: { ...state.settings, ...patch } })),

    // Sets everything in one update, so the draft is written once with the
    // title and the questions together.
    loadForm: ({ title, description, settings, fields }) =>
        set({ title, description, settings, fields, selectedKey: null }),

    // Copies the ids the server assigned onto the matching local fields, and
    // nothing else. The server's copy is a snapshot from when the request was
    // sent, so overwriting content would throw away anything typed while the
    // save was in flight. Without the ids, the next save would insert every
    // field again instead of updating it.
    applySaved: (saved) =>
        set((state) => ({
            fields: state.fields.map((field) => {
                const match = saved.find((item) =>
                    field.tempId ? item.tempId === field.tempId : item.id === field.id
                )
                if (!match) return field

                const options = field.options?.map((option, index) => {
                    const savedOption = match.options[index]
                    return savedOption && savedOption.label === option.label
                        ? { ...option, id: savedOption.id }
                        : option
                })

                return { ...field, id: match.id, ...(options ? { options } : {}) }
            }),
        })),

    removeField: (key) =>
        set((state) => ({
            // position follows the array index, so it is renumbered after a removal.
            fields: state.fields
                .filter((field) => fieldKey(field) !== key)
                .map((field, index) => ({ ...field, position: index })),
            selectedKey: state.selectedKey === key ? null : state.selectedKey,
        })),

    selectField: (key) => set({ selectedKey: key }),

    updateField: (key, patch) =>
        set((state) => ({
            fields: state.fields.map((field) =>
                fieldKey(field) === key ? { ...field, ...patch } : field
            ),
        })),

    // The id stays the same while the type changes on purpose. The server reads
    // "existing id, different type" as a replaced question: it archives the old
    // row and inserts a new one, so earlier answers stay attached to the old type.
    changeFieldType: (key, type) =>
        set((state) => ({
            fields: state.fields.map((field) => {
                if (fieldKey(field) !== key) return field

                const { options, ...rest } = field

                // Options on a non-choice field would be sent to the server as-is.
                if (!FIELD_TYPES[type].hasOptions) return { ...rest, type }

                return { ...rest, type, options: options?.length ? options : defaultOptions() }
            }),
        })),

    // The store is module-level, so it outlives the page. Without this, opening
    // a second form would show the first form's questions.
    reset: () => set({ title: "", description: "", settings: {}, fields: [], selectedKey: null }),
}))

// Selecting the object rather than the whole store means a component only
// re-renders when the selected question itself changes.
export const selectSelectedField = (state: FieldsStore) =>
    state.fields.find((field) => fieldKey(field) === state.selectedKey) ?? null

export default useFields
