"use client"

import {
  CollapsiblePanels,
  CollapsiblePanel,
} from "@workspace/ui/components/collapsible-panels"
import { useFormDraft } from "@/hooks/use-form-draft"
import { FormDndProvider } from "@/components/app/form/form-dnd"
import { ElementsPanel } from "@/components/app/form/elements-panel"
import { FormCanvas } from "@/components/app/form/form-canvas"
import { FieldSettings } from "@/components/app/form/field-settings/field-settings"

/** The three panel frame for the builder. */
export function FormBuilderLayout({ publicId }: { publicId: string }) {
  // Restores any unsaved draft on load and, on the way out, clears it and
  // resets the store, so the next form does not start with this one's questions.
  useFormDraft(publicId)

  return (
    <FormDndProvider>
    <CollapsiblePanels className="h-full">
      <CollapsiblePanel
        defaultSize={20}
        minSize={15}
        collapsible
        side="left"
        iconMode
      >
        <ElementsPanel />
      </CollapsiblePanel>

      <CollapsiblePanel defaultSize={55} minSize={30}>
        <FormCanvas publicId={publicId} />
      </CollapsiblePanel>

      <CollapsiblePanel defaultSize={25} minSize={20} collapsible side="right" iconMode>
        <FieldSettings />
      </CollapsiblePanel>
    </CollapsiblePanels>
    </FormDndProvider>
  )
}
