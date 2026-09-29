"use client"

import { useEffect } from "react"
import {
  CollapsiblePanels,
  CollapsiblePanel,
} from "@workspace/ui/components/collapsible-panels"
import useFields from "@/lib/zustand/form"
import { ElementsPanel } from "@/components/app/form/elements-panel"
import { FormCanvas } from "@/components/app/form/form-canvas"
import { FieldSettings } from "@/components/app/form/field-settings/field-settings"

/** The three panel frame for the builder. */
export function FormBuilderLayout() {
  const reset = useFields((state) => state.reset)

  // The store outlives this page, so clear it on the way out. Otherwise opening
  // another form would start with the previous form's questions.
  useEffect(() => reset, [reset])

  return (
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

      <CollapsiblePanel defaultSize={55} minSize={30} collapsible side="left">
        <FormCanvas />
      </CollapsiblePanel>

      <CollapsiblePanel defaultSize={25} minSize={20} collapsible side="right">
        <FieldSettings />
      </CollapsiblePanel>
    </CollapsiblePanels>
  )
}
