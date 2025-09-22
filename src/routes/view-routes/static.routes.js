

import express from "express";
import { handleUserAuthentication } from "../../middlewares/auth.middleware.js";
const render = express.Router();


render.get("/", handleUserAuthentication ,(req,res)=>{
    // console.log("from home",req.userID)
    res.render("home")
})

render.get("/result/:sheetId", handleUserAuthentication ,(req,res)=>{
    // console.log("from home",req.userID)
    res.render("result")
})

render.get("/auth",(req,res)=>{
    // console.log("from home",req.userID)
    res.render("auth")
})




export default render