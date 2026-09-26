import { create } from 'zustand'
import type { Fields, FormField } from '@/types/field'

type FieldsStore = {
    fields: Fields
    addField: () => void
    removeField: (index: number) => void
    updateField: (index: number, field: Partial<FormField>) => void
}

const useFields = create<FieldsStore>((set) => ({
    fields: [],
    addField: () =>
        set((state) => ({
            fields: [
                ...state.fields,
                {
                    type: "short_text",
                    label: "Untitled Field",
                    description: null,
                    required: false,
                    config: {},
                } as FormField,
            ],
        })),
    removeField: (index) =>
        set((state) => ({
            fields: state.fields.filter((_, i) => i !== index),
        })),
    updateField: (index: number, field: Partial<FormField>) => (
        set((state) => ({
            fields: state.fields.map((f, i) => (i === index ? { ...f, ...field } : f))
        }))
    )
}))

export default useFields