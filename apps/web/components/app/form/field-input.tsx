import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"
import { Checkbox } from "@workspace/ui/components/checkbox"
import { RadioGroup, RadioGroupItem } from "@workspace/ui/components/radio-group"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@workspace/ui/components/select"
import type { FormField } from "@/types/field"
import type { AnswerValue } from "@/types/answer"

export function FieldInput({
    id,
    field,
    value,
    onChange,
    error,
}: {
    id: string
    field: FormField
    value: AnswerValue
    onChange: (value: AnswerValue) => void
    error?: string
}) {
    const options = field.options ?? []

    switch (field.type) {
        case "short_text":
            return (
                <Input
                    id={id}
                    type="text"
                    placeholder={field.placeholder ?? undefined}
                    required={field.required}
                    aria-invalid={!!error}
                    value={(value as string) ?? ""}
                    onChange={(e) => onChange(e.target.value)}
                />
            )

        case "email":
            return (
                <Input
                    id={id}
                    type="email"
                    placeholder={field.placeholder ?? undefined}
                    required={field.required}
                    aria-invalid={!!error}
                    value={(value as string) ?? ""}
                    onChange={(e) => onChange(e.target.value)}
                />
            )

        case "number":
            return (
                <Input
                    id={id}
                    type="number"
                    placeholder={field.placeholder ?? undefined}
                    required={field.required}
                    aria-invalid={!!error}
                    value={(value as string) ?? ""}
                    onChange={(e) => onChange(e.target.value)}
                />
            )

        case "date":
            return (
                <Input
                    id={id}
                    type="date"
                    required={field.required}
                    aria-invalid={!!error}
                    value={(value as string) ?? ""}
                    onChange={(e) => onChange(e.target.value)}
                />
            )

        case "long_text":
            return (
                <Textarea
                    id={id}
                    placeholder={field.placeholder ?? undefined}
                    required={field.required}
                    aria-invalid={!!error}
                    value={(value as string) ?? ""}
                    onChange={(e) => onChange(e.target.value)}
                />
            )

        case "dropdown":
            return (
                <Select
                    value={(value as string)}
                    onValueChange={(next) => onChange(next)}
                >
                    <SelectTrigger id={id} aria-invalid={!!error}>
                        <SelectValue placeholder={field.placeholder ?? "Select an option"} />
                    </SelectTrigger>
                    <SelectContent>
                        {options.map((option) => (
                            <SelectItem key={option.id} value={String(option.id)}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )

        case "single_select":
            return (
                <RadioGroup
                    value={(value as string) ?? ""}
                    onValueChange={(next) => onChange(next)}
                    aria-invalid={!!error}
                >
                    {options.map((option) => {
                        const optionId = `${id}-${option.id}`
                        return (
                            <div key={option.id} className="flex items-center gap-2">
                                <RadioGroupItem id={optionId} value={String(option.id)} />
                                <label htmlFor={optionId} className="text-sm">
                                    {option.label}
                                </label>
                            </div>
                        )
                    })}
                </RadioGroup>
            )

        case "multi_select": {
            const selected = new Set((value as string[]) ?? [])
            return (
                <div className="flex flex-col gap-2">
                    {options.map((option) => {
                        const key = String(option.id)
                        const optionId = `${id}-${key}`
                        return (
                            <div key={option.id} className="flex items-center gap-2">
                                <Checkbox
                                    id={optionId}
                                    checked={selected.has(key)}
                                    onCheckedChange={(checked) => {
                                        const next = new Set(selected)
                                        if (checked) next.add(key)
                                        else next.delete(key)
                                        onChange(Array.from(next))
                                    }}
                                />
                                <label htmlFor={optionId} className="text-sm">
                                    {option.label}
                                </label>
                            </div>
                        )
                    })}
                </div>
            )
        }

        default: {
            // Exhaustiveness check: if fieldTypeSchema ever grows a new
            // variant, this line fails to typecheck until a case is added.
            const _exhaustive: never = field.type
            return null
        }
    }
}