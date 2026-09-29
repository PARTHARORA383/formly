import { create } from 'zustand'
import type { Fields, FormField } from '@/types/field'
import { FIELD_TYPES, defaultOptions, type FieldType } from '@/utils/constants'

// Saved fields have an id, unsaved ones only a tempId. One string covers both,
// so selection works before and after the first save and survives reordering.
export function fieldKey(field: FormField) {
    return String(field.id ?? field.tempId)
}

type FieldsStore = {
    fields: Fields
    selectedKey: string | null
    addField: (type?: FieldType) => void
    removeField: (key: string) => void
    selectField: (key: string) => void
    updateField: (key: string, patch: Partial<FormField>) => void
    changeFieldType: (key: string, type: FieldType) => void
    reset: () => void
}

const useFields = create<FieldsStore>((set) => ({
    fields: [],
    selectedKey: null,

    addField: (type = "short_text") =>
        set((state) => {
            const field: FormField = {
                tempId: `tmp_${crypto.randomUUID()}`,
                type,
                label: "Untitled question",
                required: false,
                position: state.fields.length,
                config: {},
                // A choice question with no options would render empty.
                ...(FIELD_TYPES[type].hasOptions ? { options: defaultOptions() } : {}),
            }

            return { fields: [...state.fields, field], selectedKey: fieldKey(field) }
        }),

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
    reset: () => set({ fields: [], selectedKey: null }),
}))

// Selecting the object rather than the whole store means a component only
// re-renders when the selected question itself changes.
export const selectSelectedField = (state: FieldsStore) =>
    state.fields.find((field) => fieldKey(field) === state.selectedKey) ?? null

export default useFields
