"use client"

import * as React from "react"
import {
  CursorPointer01Icon,
  Menu01Icon,
  TextFontIcon,
  TextAlignLeftIcon,
} from "@hugeicons/core-free-icons"
import type { IconSvgElement } from "@hugeicons/react"
import { FieldGroup } from "@workspace/ui/components/field"
import { Separator } from "@workspace/ui/components/separator"
import { useCollapsiblePanel } from "@workspace/ui/components/collapsible-panels"
import { cn } from "@workspace/ui/lib/utils"
import useFields, { fieldKey, selectSelectedField } from "@/lib/zustand/form"
import { FieldTypeSelect } from "@/components/app/form/field-settings/field-type-select"
import { FieldLabelInput } from "@/components/app/form/field-settings/field-label-input"
import { FieldDescriptionInput } from "@/components/app/form/field-settings/field-description-input"
import { FieldPlaceholderInput } from "@/components/app/form/field-settings/field-placeholder-input"
import { FieldRequiredSwitch } from "@/components/app/form/field-settings/field-required-switch"
import { FieldOptionsEditor } from "@/components/app/form/field-settings/field-options-editor"
import { IconTooltip } from "@/components/common/icon-tooltip"
import { EmptyState } from "@/components/common/empty-state"
import { FIELD_TYPES } from "@/utils/constants"

// A minimum width keeps the content from reflowing while the panel narrows;
// the panel edge clips it instead. Padding tightens so a 32px icon fits the rail.
const PANEL =
  "flex min-w-64 flex-col gap-4 px-4 pt-3 pb-4 transition-[padding] duration-200 ease-linear group-data-[collapsible=icon]:px-2"

// Fades out while the panel is collapsed to its icon rail, like the Elements panel.
const FADE =
  "transition-opacity duration-200 ease-linear group-data-[collapsible=icon]:opacity-0"

// A control that becomes a single icon when the panel collapses: the control
// fades out and its icon fades in on the spot where the control was, so the
// rail lines up with the open panel. Clicking the icon opens the panel.
function RailSlot({
  icon,
  label,
  align = "bottom",
  children,
}: {
  icon: IconSvgElement
  label: string
  /** Where the icon sits: over a one-line control, or at the top of a tall one. */
  align?: "bottom" | "top"
  children: React.ReactNode
}) {
  const { isCollapsed, expand } = useCollapsiblePanel()

  return (
    <div className="relative">
      {/* inert while collapsed, so the hidden control can't be focused. */}
      <div inert={isCollapsed} className={FADE}>
        {children}
      </div>

      <IconTooltip
        icon={icon}
        tooltip={label}
        side="left"
        onClick={expand}
        className={cn(
          "pointer-events-none absolute left-0 size-8 rounded-lg border bg-background opacity-0 transition-opacity duration-200 ease-linear group-data-[collapsible=icon]:pointer-events-auto group-data-[collapsible=icon]:opacity-100",
          align === "bottom" ? "bottom-0" : "top-7"
        )}
      />
    </div>
  )
}

// The only component in this folder that reads the store. The controls
// above take a value and an onChange, so each works without it.
export function FieldSettings() {
  const selectedField = useFields(selectSelectedField)
  const updateField = useFields((state) => state.updateField)
  const changeFieldType = useFields((state) => state.changeFieldType)
  const baseId = React.useId()
  const { isCollapsed } = useCollapsiblePanel()

  if (!selectedField) {
    return (
      <div className={PANEL}>
        <h3 className={cn("text-sm font-medium whitespace-nowrap", FADE)}>Question settings</h3>

        <EmptyState
          icon={CursorPointer01Icon}
          title="No question selected"
          description="Select a question to edit its settings."
          className={FADE}
        />
      </div>
    )
  }

  const key = fieldKey(selectedField)
  const definition = FIELD_TYPES[selectedField.type]

  return (
    <div className={PANEL}>
      <h3 className={cn("text-sm font-medium whitespace-nowrap", FADE)}>Question settings</h3>

      <FieldGroup>
        <RailSlot icon={Menu01Icon} label="Type">
          <FieldTypeSelect
            id={`${baseId}-type`}
            value={selectedField.type}
            onChange={(type) => changeFieldType(key, type)}
          />
        </RailSlot>

        <RailSlot icon={TextFontIcon} label="Label">
          <FieldLabelInput
            id={`${baseId}-label`}
            value={selectedField.label}
            onChange={(label) => updateField(key, { label })}
          />
        </RailSlot>

        <RailSlot icon={TextAlignLeftIcon} label="Description" align="top">
          <FieldDescriptionInput
            id={`${baseId}-description`}
            value={selectedField.description}
            onChange={(description) => updateField(key, { description })}
          />
        </RailSlot>

        {/* Only the first three controls keep an icon; the rest just fade. */}
        <div inert={isCollapsed} className={cn("flex flex-col gap-4", FADE)}>
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
        </div>
      </FieldGroup>
    </div>
  )
}
