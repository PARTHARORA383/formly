import { PublicForm } from "@/components/app/form/public-form"

// Outside the (authenticated) group on purpose: no auth guard, so anyone with
// the link can open it. params is a promise in this version of Next.
export default async function PublicFormPage({
  params,
}: {
  params: Promise<{ publicId: string }>
}) {
  const { publicId } = await params

  return <PublicForm publicId={publicId} />
}
