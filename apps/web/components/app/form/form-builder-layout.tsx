"use client"

import {
  CollapsiblePanels,
  CollapsiblePanel,
} from "@workspace/ui/components/collapsible-panels"
import { FormDraftProvider } from "@/lib/providers/form-draft-provider"
import { ElementsPanel } from "@/components/app/form/elements-panel"
import { FormCanvas } from "@/components/app/form/form-canvas"
import { FieldSettings } from "@/components/app/form/field-settings/field-settings"

/** The three panel frame for the builder. */
export function FormBuilderLayout() {
  return (
    <FormDraftProvider>
      <CollapsiblePanels className="h-full">
        <CollapsiblePanel defaultSize={20} minSize={15} collapsible side="left">
          <ElementsPanel />
        </CollapsiblePanel>

        <CollapsiblePanel defaultSize={55} minSize={30} collapsible side="left">
          <FormCanvas />
        </CollapsiblePanel>

        <CollapsiblePanel defaultSize={25} minSize={20} collapsible side="right">
          <FieldSettings />
        </CollapsiblePanel>
      </CollapsiblePanels>
    </FormDraftProvider>
  )
}
