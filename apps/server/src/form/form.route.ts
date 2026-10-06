

import { Router } from "express"
import FormController from "./form.controller.js"
import authenticate from "../common/middleware/authenticate.js"
import validateBody from "../common/middleware/validate-body.js"
import { createFormSchema, submitFormSchema, updateFormSchema } from "./form.types.js"

const router = Router()


// Open to everyone: the people filling a form in are not logged in, so this is
// the one route here without authenticate. The service decides what is allowed.
router.post('/submit', validateBody(submitFormSchema), FormController.submitForm)
router.post('/create', authenticate, validateBody(createFormSchema), FormController.createForm)
router.get('/', authenticate, FormController.getForms)
router.get('/:publicId', authenticate, FormController.getForm)
router.put('/:publicId', authenticate, validateBody(updateFormSchema), FormController.updateForm)



export default router   