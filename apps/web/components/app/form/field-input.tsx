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
import { DEFAULT_PLACEHOLDER } from "@/utils/constants"
import type { FieldOption, FormField } from "@/types/field"
import type { AnswerValue } from "@/types/answer"

// Options only get an id once they are saved. Until then String(option.id) is
// "undefined" for every one of them, so they would all share a value and a DOM
// id. Falling back to the label text keeps them distinct in the meantime.
function optionValue(option: FieldOption) {
    return String(option.id ?? option.label)
}

// Keys and DOM ids also need to survive two unsaved options sharing a label, so
// they fall back to the position rather than the text.
function optionKey(option: FieldOption, index: number) {
    return option.id ?? `new-${index}`
}

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
                    placeholder={field.placeholder || DEFAULT_PLACEHOLDER}
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
                    placeholder={field.placeholder || DEFAULT_PLACEHOLDER}
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
                    placeholder={field.placeholder || DEFAULT_PLACEHOLDER}
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
                    // One input tall to start; field-sizing-content grows it as
                    // text is added, so the drag handle isn't needed.
                    rows={1}
                    className="min-h-8 resize-none py-[5px]"
                    placeholder={field.placeholder || DEFAULT_PLACEHOLDER}
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
                    // Base UI passes null when the selection is cleared.
                    onValueChange={(next) => onChange(next ?? undefined)}
                >
                    <SelectTrigger id={id} aria-invalid={!!error} className="w-full">
                        <SelectValue placeholder={field.placeholder || DEFAULT_PLACEHOLDER} />
                    </SelectTrigger>
                    <SelectContent>
                        {options.map((option, index) => (
                            <SelectItem key={optionKey(option, index)} value={optionValue(option)}>
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
                    {options.map((option, index) => {
                        const optionId = `${id}-${optionKey(option, index)}`
                        return (
                            <div key={optionKey(option, index)} className="flex items-center gap-2">
                                <RadioGroupItem id={optionId} value={optionValue(option)} />
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
                    {options.map((option, index) => {
                        const key = optionValue(option)
                        const optionId = `${id}-${optionKey(option, index)}`
                        return (
                            <div key={optionKey(option, index)} className="flex items-center gap-2">
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