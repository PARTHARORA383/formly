"use client"

import { Button } from "@workspace/ui/components/button"
import { useCollapsiblePanel } from "@workspace/ui/components/collapsible-panels"
import useFields from "@/lib/zustand/form"
import { PlusIcon } from "@workspace/ui/icons"

// Lives at the bottom of the Elements panel. Like the element buttons, it only
// opens the panel when clicked from the collapsed rail, so a stray click on a
// narrow rail can't change the form.
export function AddQuestionButton() {
  const addField = useFields((state) => state.addField)
  const { isCollapsed, expand } = useCollapsiblePanel()

  return (
    <Button
      type="button"
      variant="ghost"
      title="Add question"
      aria-label="Add question"
      // Muted rather than primary. In the rail the padding shrinks so the icon
      // sits in the middle of the 32px button (1px border + 6px + 18px icon).
      className="w-full justify-start gap-2 overflow-hidden bg-muted px-2 whitespace-nowrap text-foreground transition-[padding,background-color] hover:bg-muted/70 group-data-[collapsible=icon]:px-1.5 dark:hover:bg-muted/70"
      onClick={() => (isCollapsed ? expand() : addField())}
    >
      <PlusIcon className="size-[18px] shrink-0" />
      Add question
    </Button>
  )
}
