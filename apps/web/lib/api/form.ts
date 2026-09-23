import api  from "@/lib/axios"

class FormApi {

    static async createForm(formData: any) {
        return api.post('/create' , formData)
    }

}