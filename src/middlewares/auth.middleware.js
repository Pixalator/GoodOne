import { getUser } from "../services/auth.service.js";
import userModel from "../models/user.model.js";

async function handleUserAuthentication(req, res, next) {
  try {
    const userToken = req.cookies?.token;

    // console.log("req.xhr",req.xhr)
    // console.log("req.accept header",req.headers.accept.includes("json"))
    

    const isXML = req.xhr || req.headers.accept.includes("json");
    // console.log("isXML",isXML)
    // console.log(userToken)
    if (!userToken) {
      if (isXML) {
        return res.status(401).json({ redirectTo: "/auth" });
      }

      return res.redirect("/auth");
    }
    const user = getUser(userToken); // will return a verified paylaod
    // console.log(user)
    if (!user) {
      if (isXML) {
        return res.status(401).json({ redirectTo: "/auth" });
      }

      return res.redirect("/auth");
    }
    // console.log(decoded_payload._id);
    req.userID = user._id;
    req.userEmail = user.email;
    // console.log(req.userID)
    next();
  } catch (e) {
    console.log(e);
  }
}


//for guest page and home page
function redirectIfLoggedIn(req, res, next) {
  const userToken = req.cookies?.token;
  const userPayload = userToken ? getUser(userToken) : null;

  if (userPayload) {
    return res.redirect("/");
  }

  next();
}


// Example: Middleware style
 async function isAdmin(req, res, next) {
  const user = await userModel.findById(req.userID); // or req.user._id

  if (!user || user.role !== "admin") {
    return res.status(403).render("unauthorized");
  }
  next();
}



export { handleUserAuthentication, redirectIfLoggedIn ,isAdmin };