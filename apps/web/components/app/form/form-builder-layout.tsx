"use client"

import {
  CollapsiblePanels,
  CollapsiblePanel,
} from "@workspace/ui/components/collapsible-panels"

/** The three panel frame for the builder. */
export function FormBuilderLayout() {
  return (
    <CollapsiblePanels className="h-full">
      <CollapsiblePanel defaultSize={20} minSize={15} collapsible side="left">
        <div className="p-3 text-sm">Questions</div>
      </CollapsiblePanel>

      <CollapsiblePanel defaultSize={55}>
        <div className="p-3 text-sm">Canvas</div>
      </CollapsiblePanel>

      <CollapsiblePanel defaultSize={25} minSize={20} collapsible side="right">
        <div className="p-3 text-sm">Settings</div>
      </CollapsiblePanel>
    </CollapsiblePanels>
  )
}
