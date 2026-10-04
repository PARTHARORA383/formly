"use client"

import * as React from "react"
import {
  Tabs,
  TabsContent,
  TabsContents,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/animate-ui/components/radix/tabs"
import { useCollapsiblePanel } from "@workspace/ui/components/collapsible-panels"
import { cn } from "@workspace/ui/lib/utils"
import { FADE } from "@/components/app/form/field-settings/settings-styles"
import { FieldSettings } from "@/components/app/form/field-settings/field-settings"
import { FormSettings } from "@/components/app/form/form-settings"
import useFields from "@/lib/zustand/form"

type Tab = "form" | "question"

// The right-hand panel: settings for the form, and for the selected question.
// It opens on the form tab, and jumps to the question tab whenever a question
// becomes selected, which includes adding one. Picking the form tab by hand
// sticks until the selection changes again.
export function SettingsPanel() {
  const selectedKey = useFields((state) => state.selectedKey)
  const { isCollapsed } = useCollapsiblePanel()
  const tab = useFields((state) => state.settingsTab)
  const setTab = useFields((state) => state.setSettingsTab)

  React.useEffect(() => {
    if (selectedKey) setTab("question")
  }, [selectedKey, setTab])

  return (
    <Tabs value={tab} onValueChange={(next) => setTab(next as Tab)} className="gap-0">
      {/* Right padding clears the collapse toggle pinned to the panel's corner. */}
      <div inert={isCollapsed} className={cn("min-w-64 px-4 pt-3 pr-12", FADE)}>
        <TabsList className="w-full">
          <TabsTrigger value="form">Form</TabsTrigger>
          <TabsTrigger value="question">Question</TabsTrigger>
        </TabsList>
      </div>

      <TabsContents>
        <TabsContent value="form">
          <FormSettings />
        </TabsContent>
        <TabsContent value="question">
          <FieldSettings />
        </TabsContent>
      </TabsContents>
    </Tabs>
  )
}
