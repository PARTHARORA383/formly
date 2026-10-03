"use client"

import { Field, FieldGroup, FieldLabel } from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"
import { cn } from "@workspace/ui/lib/utils"
import { useCollapsiblePanel } from "@workspace/ui/components/collapsible-panels"
import { FORM_FONTS, resolveFormFont, type FormFontId } from "@/lib/form-fonts"
import { FADE, PANEL } from "@/components/app/form/field-settings/settings-styles"
import useFields from "@/lib/zustand/form"

const FONT_IDS = Object.keys(FORM_FONTS) as FormFontId[]

// Settings that belong to the form as a whole, not to one question. They are
// stored in forms.settings and travel with the form on every save.
export function FormSettings() {
  const { isCollapsed } = useCollapsiblePanel()
  const title = useFields((state) => state.title)
  const description = useFields((state) => state.description)
  const setTitle = useFields((state) => state.setTitle)
  const setDescription = useFields((state) => state.setDescription)
  const fontFamily = useFields((state) => state.settings.fontFamily)
  const setSettings = useFields((state) => state.setSettings)
  const current = resolveFormFont(fontFamily)

  return (
    <div inert={isCollapsed} className={cn(PANEL, FADE)}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="form-title">Title</FieldLabel>
          <Input
            id="form-title"
            value={title}
            maxLength={255}
            placeholder="Untitled form"
            onChange={(event) => setTitle(event.target.value)}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="form-description">Description</FieldLabel>
          <Textarea
            id="form-description"
            rows={3}
            value={description}
            placeholder="Tell people what this form is for"
            onChange={(event) => setDescription(event.target.value)}
          />
        </Field>
      </FieldGroup>

      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-medium">Font</h3>
        <p className="text-xs text-muted-foreground">
          The typeface people see when they fill the form in. The cards on the canvas use it too.
        </p>
      </div>

      <div role="radiogroup" aria-label="Form font" className="grid grid-cols-2 gap-2">
        {FONT_IDS.map((id) => {
          const font = FORM_FONTS[id]
          const selected = id === current

          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => setSettings({ fontFamily: id })}
              className={cn(
                "flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition-colors outline-none",
                selected
                  ? "border-foreground/30 bg-muted"
                  : "border-border/30 hover:bg-muted/60"
              )}
            >
              <span className="text-2xl leading-none" style={{ fontFamily: font.family }}>
                Aa
              </span>
              <span className="text-xs font-medium">{font.label}</span>
              <span className="text-xs text-muted-foreground">{font.note}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
