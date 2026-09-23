"use client"

import {
  CollapsiblePanels,
  CollapsiblePanel,
} from "@workspace/ui/components/collapsible-panels"

type FormBuilderLayoutProps = {
  questions: React.ReactNode
  canvas: React.ReactNode
  settings: React.ReactNode
}

/**
 * The three panel frame for the builder. Named slots rather than children, so
 * callers can't accidentally reorder the panels or pass the wrong count.
 */
export function FormBuilderLayout({
  questions,
  canvas,
  settings,
}: FormBuilderLayoutProps) {
  return (
    <CollapsiblePanels className="h-full ">
      <CollapsiblePanel defaultSize={20} minSize={15} collapsible side="left">
        {questions}
      </CollapsiblePanel>

      <CollapsiblePanel defaultSize={55}>{canvas}</CollapsiblePanel>

      <CollapsiblePanel defaultSize={25} minSize={20} collapsible side="right">
        {settings}
      </CollapsiblePanel>
    </CollapsiblePanels>
  )
}
