"use client"

import * as React from "react"
import { FieldGroup } from "@workspace/ui/components/field"
import { Separator } from "@workspace/ui/components/separator"
import useFields, { fieldKey, selectSelectedField } from "@/lib/zustand/form"
import { FieldTypeSelect } from "@/components/app/form/field-settings/field-type-select"
import { FieldLabelInput } from "@/components/app/form/field-settings/field-label-input"
import { FieldDescriptionInput } from "@/components/app/form/field-settings/field-description-input"
import { FieldPlaceholderInput } from "@/components/app/form/field-settings/field-placeholder-input"
import { FieldRequiredSwitch } from "@/components/app/form/field-settings/field-required-switch"
import { FieldOptionsEditor } from "@/components/app/form/field-settings/field-options-editor"
import { FIELD_TYPES } from "@/utils/constants"

// The only component in this folder that reads the store. The controls
// above take a value and an onChange, so each works without it.
export function FieldSettings() {
  const selectedField = useFields(selectSelectedField)
  const updateField = useFields((state) => state.updateField)
  const changeFieldType = useFields((state) => state.changeFieldType)
  const baseId = React.useId()

  if (!selectedField) {
    return (
      <p className="py-3 pr-12 pl-4 text-sm text-muted-foreground">
        Select a question to edit its settings.
      </p>
    )
  }

  const key = fieldKey(selectedField)
  const definition = FIELD_TYPES[selectedField.type]

  return (
    <div className="flex flex-col gap-4 px-4 pt-3 pb-4">
      <h3 className="text-sm font-medium">Question settings</h3>

      <FieldGroup>
        <FieldTypeSelect
          id={`${baseId}-type`}
          value={selectedField.type}
          onChange={(type) => changeFieldType(key, type)}
        />

        <FieldLabelInput
          id={`${baseId}-label`}
          value={selectedField.label}
          onChange={(label) => updateField(key, { label })}
        />

        <FieldDescriptionInput
          id={`${baseId}-description`}
          value={selectedField.description}
          onChange={(description) => updateField(key, { description })}
        />

        {definition.hasPlaceholder && (
          <FieldPlaceholderInput
            id={`${baseId}-placeholder`}
            value={selectedField.placeholder}
            onChange={(placeholder) => updateField(key, { placeholder })}
          />
        )}

        <Separator />

        <FieldRequiredSwitch
          id={`${baseId}-required`}
          checked={selectedField.required}
          onChange={(required) => updateField(key, { required })}
        />

        {definition.hasOptions && (
          <>
            <Separator />
            <FieldOptionsEditor
              value={selectedField.options ?? []}
              onChange={(options) => updateField(key, { options })}
            />
          </>
        )}
      </FieldGroup>
    </div>
  )
}
