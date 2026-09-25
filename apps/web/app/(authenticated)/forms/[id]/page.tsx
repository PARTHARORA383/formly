import { FormBuilderLayout } from "@/components/app/form/form-builder-layout"

// params is a promise in this version of Next and must be awaited.
export default async function FormBuilderPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <div className="h-full" data-form-id={id}>
      <FormBuilderLayout />
    </div>
  )
}
