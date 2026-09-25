import { NewFormButton } from "@/components/app/form/new-form-button"
import { FormList } from "@/components/app/form/form-list"

export default function FormsPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium">Forms</h2>
          <p className="text-sm text-muted-foreground">
            Everything you&apos;ve built, draft and published.
          </p>
        </div>
        <NewFormButton />
      </div>

      <FormList />
    </div>
  )
}
