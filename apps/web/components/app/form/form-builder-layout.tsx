"use client"

import {
  CollapsiblePanels,
  CollapsiblePanel,
} from "@workspace/ui/components/collapsible-panels"

import { Spinner } from "@/components/kibo-ui/spinner"
import { EmptyState } from "@/components/common/empty-state"
import { useFormDraft } from "@/hooks/use-form-draft"
import { useLoadForm } from "@/hooks/use-load-form"
import { FormDndProvider } from "@/components/app/form/form-dnd"
import { ElementsPanel } from "@/components/app/form/elements-panel"
import { FormCanvas } from "@/components/app/form/canvas/form-canvas"
import { SettingsPanel } from "@/components/app/form/settings-panel"
import { HelpCircleIcon } from "@workspace/ui/icons"

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
        defaultSize="25%"
        minSize="18%"
        collapsible
        side="left"
        iconMode
        // Opens as the icon rail; the canvas gets the room.
        defaultCollapsed
      >
        <ElementsPanel />
      </CollapsiblePanel>

      {/* No default size: it takes whatever the other two leave, which is what
          makes the pixel-sized collapsed rail and the percentage-sized settings
          panel add up. */}
      <CollapsiblePanel minSize="30%">
        <FormCanvas publicId={publicId} />
      </CollapsiblePanel>

      <CollapsiblePanel defaultSize="30%" minSize="20%" collapsible side="right" iconMode>
        <SettingsPanel />
      </CollapsiblePanel>
    </CollapsiblePanels>
    </FormDndProvider>
  )
}
