import {
    Field,
    FieldContent,
    FieldDescription,
    FieldError,
    FieldLabel,
} from "@workspace/ui/components/field"
import { cn } from "@workspace/ui/lib/utils"
import type { FormField } from "@/types/field"
import { FieldInput } from "@/components/app/form/field-input"
import type { AnswerValue } from "@/types/answer"



type FieldRendererProps = {
    field: FormField
    value: AnswerValue
    onChange: (value: AnswerValue) => void
    error?: string
    className?: string
}

export function FieldRenderer({ field, value, onChange, error, className }: FieldRendererProps) {

    const id = field.id ? `field-${field.id}` : `field-${field.tempId}`

    return (
        <Field data-invalid={error ? true : undefined} className={cn("min-w-0", className)}>
            <FieldLabel htmlFor={id} className="[overflow-wrap:anywhere]">
                {field.label}
                {field.required && <span aria-hidden="true"> *</span>}
            </FieldLabel>

            {field.description && <FieldDescription className="[overflow-wrap:anywhere]">
                    {field.description}
                </FieldDescription>}

            <FieldContent>
                <FieldInput id={id} field={field} value={value} onChange={onChange} error={error} />
            </FieldContent>

            {error && <FieldError>{error}</FieldError>}
        </Field>
    )
}