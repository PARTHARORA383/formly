"use client"

import {
  CollapsiblePanels,
  CollapsiblePanel,
} from "@workspace/ui/components/collapsible-panels"
import { HelpCircleIcon } from "@hugeicons/core-free-icons"
import { Spinner } from "@/components/kibo-ui/spinner"
import { EmptyState } from "@/components/common/empty-state"
import { useFormDraft } from "@/hooks/use-form-draft"
import { useLoadForm } from "@/hooks/use-load-form"
import { FormDndProvider } from "@/components/app/form/form-dnd"
import { ElementsPanel } from "@/components/app/form/elements-panel"
import { FormCanvas } from "@/components/app/form/form-canvas"
import { FieldSettings } from "@/components/app/form/field-settings/field-settings"

/** The three panel frame for the builder. */
export function FormBuilderLayout({ publicId }: { publicId: string }) {
  // Restores any unsaved draft on load and, on the way out, clears it and
  // resets the store, so the next form does not start with this one's questions.
  useFormDraft(publicId)

  // Fills the store from the server unless there is a draft, which wins.
  const { isPending, isError } = useLoadForm(publicId)

  if (isPending) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner variant="throbber" className="size-5" />
      </div>
    )
  }

  if (isError) {
    return (
      <EmptyState
        icon={HelpCircleIcon}
        title="Form not found"
        description="It may have been removed, or it belongs to another account."
        className="h-full justify-center"
      />
    )
  }

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
