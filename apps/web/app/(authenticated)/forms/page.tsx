import { FormBuilderLayout } from "@/components/app/form/form-builder-layout"

export default function FormsPage() {
  return (
    <div className="h-full">
      <FormBuilderLayout
        questions={<div className="p-3 text-sm">Questions</div>}
        canvas={<div className="p-3 text-sm">Canvas</div>}
        settings={<div className="p-3 text-sm">Settings</div>}
      />
    </div>
  )
}
