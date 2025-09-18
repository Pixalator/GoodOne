import express from "express"

import { handleUserAuthentication } from "../../../middlewares/auth.middleware.js"
import { handleEvaluation } from "../../../controllers/evaluator.controllers.js"

const render=express.Router()

render.route("/evaluate")
.post(handleUserAuthentication, upload.single("file"),handleEvaluation)




export default render

