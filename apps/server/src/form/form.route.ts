

import { Router } from "express"
import FormController from "./form.controller.js"
import authenticate from "../common/middleware/authenticate.js"
import validateBody from "../common/middleware/validate-body.js"
import { createFormSchema, updateFormSchema } from "./form.types.js"

const router = Router()


router.post('/create', authenticate, validateBody(createFormSchema), FormController.createForm)
router.get('/', authenticate, FormController.getForms)
router.get('/:publicId', authenticate, FormController.getForm)
router.put('/:publicId', authenticate, validateBody(updateFormSchema), FormController.updateForm)



export default router   