import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import FormApi from "@/lib/api/form"
import {
  createFormSchema,
  updateFormSchema,
  type CreateFormInput,
  type SubmitFormInput,
  type UpdateFormInput,
} from "@/lib/zod/form"
import type { Form, FormWithFields, PublicForm, SavedForm } from "@/types/form"

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

function useForm(publicId: string) {
  return useQuery({
    queryKey: formKeys.detail(publicId),
    queryFn: async () => {
      const res = await FormApi.get(publicId)
      return res.data.data as FormWithFields
    },
    // A missing form is a 404, which retrying will not fix.
    retry: false,
  })
}

function usePublicForm(publicId: string) {
  return useQuery({
    queryKey: ["public-form", publicId] as const,
    queryFn: async () => {
      const res = await FormApi.getPublic(publicId)
      return res.data.data as PublicForm
    },
    // A missing form is a 404, which retrying will not fix.
    retry: false,
  })
}

function useSubmitForm() {
  return useMutation({
    mutationFn: async (input: SubmitFormInput) => {
      const res = await FormApi.submit(input)
      return res.data.data as { responseId: number }
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

function useUpdateForm(publicId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: UpdateFormInput) => {
      const payload = updateFormSchema.parse(input)
      const res = await FormApi.update(publicId, payload)
      return res.data.data as SavedForm
    },
    onSuccess: () => {
      // updatedAt moved, and the list is ordered by it.
      queryClient.invalidateQueries({ queryKey: formKeys.all })
    },
  })
}

export { formKeys, useForms, useForm, usePublicForm, useCreateForm, useUpdateForm, useSubmitForm }
