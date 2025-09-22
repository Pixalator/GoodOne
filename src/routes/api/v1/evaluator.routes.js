import express from "express"
import { upload } from "../../../middlewares/multer.middleware.js"
import { handleUserAuthentication } from "../../../middlewares/auth.middleware.js"
import {  handleOcr,handleEvaluation , handleGetResultById } from "../../../controllers/evaluator.controllers.js"

const render=express.Router()

render.route("/evaluate")
.post(handleUserAuthentication,handleEvaluation)

render.route("/ocr")
.post(handleUserAuthentication, upload.single("file"),handleOcr)

render.route("/result/:sheetId")
.get(handleUserAuthentication,handleGetResultById)


export default render

