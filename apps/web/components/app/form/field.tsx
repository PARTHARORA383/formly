import {
    Field,
    FieldContent,
    FieldDescription,
    FieldError,
    FieldLabel,
} from "@workspace/ui/components/field"
import type { FormField } from "@/types/field"
import { FieldInput } from "@/components/app/form/field-input"
import type { AnswerValue } from "@/types/answer"



type FieldRendererProps = {
    field: FormField
    value: AnswerValue
    onChange: (value: AnswerValue) => void
    error?: string
}

export function FieldRenderer({ field, value, onChange, error }: FieldRendererProps) {

    const id = field.id ? `field-${field.id}` : `field-${field.tempId}`

    return (
        <Field data-invalid={error ? true : undefined}>
            <FieldLabel htmlFor={id}>
                {field.label}
                {field.required && <span aria-hidden="true"> *</span>}
            </FieldLabel>

            {field.description && <FieldDescription>{field.description}</FieldDescription>}

            <FieldContent>
                <FieldInput id={id} field={field} value={value} onChange={onChange} error={error} />
            </FieldContent>

            {error && <FieldError>{error}</FieldError>}
        </Field>
    )
}