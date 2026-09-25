import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import FormApi from "@/lib/api/form"
import { createFormSchema, type CreateFormInput } from "@/lib/zod/form"
import type { Form } from "@/types/form"

const formKeys = {
  all: ["forms"] as const,
  detail: (publicId: string) => ["forms", publicId] as const,
}

function useForms() {
  return useQuery({
    queryKey: formKeys.all,
    queryFn: async () => {
      const res = await FormApi.list()
      return res.data.data as Form[]
    },
  })
}

function useCreateForm() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateFormInput) => {
      // Parse before sending so a malformed payload fails here with a clear
      // error, rather than as a 400 from the server.
      const payload = createFormSchema.parse(input)
      const res = await FormApi.create(payload)
      return res.data.data as Form
    },
    onSuccess: () => {
      // The list is now missing a row, so mark it stale.
      queryClient.invalidateQueries({ queryKey: formKeys.all })
    },
  })
}

export { formKeys, useForms, useCreateForm }
