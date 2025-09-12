import dotenv from 'dotenv';
dotenv.config()
import jwt from "jsonwebtoken"

const secret = process.env.JWT_SECRET

//create jwt
function setUser(userCred){
    if(!userCred) return null ; 
    try{
        return jwt.sign({
            _id:userCred._id,
            email:userCred.email,
        },secret) //we provide payload from the form input and then encrypt and create token 
    }catch(error){
        console.error("JWT Creation failed", error.message)
        return null;
    }
}

//verify jwt
function getUser(token){
    if(!token) return null ;
    try{
        return jwt.verify(token,secret) //returns decoded payload (user details: _id & email which we later use to find user details from DB)
     }catch(error){
        console.error("JWT Verification failed:", error.message)
        return null;
     }
}


export {setUser,getUser}