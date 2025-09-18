import express from "express"
import {  handleCreateUser, handleLoginUser } from "../../../controllers/users.controller.js"
import { handleCreateTempUser } from "../../../controllers/tempUser.controller.js"
import { handleUserAuthentication } from "../../../middlewares/auth.middleware.js"
const render=express.Router()

render.route("/login")
.post(handleLoginUser)

render.route("/send-otp")
.post(handleCreateTempUser)

render.route("/verify-signup")
.post(handleCreateUser)




export default render

