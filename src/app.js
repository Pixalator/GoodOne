import dotenv from 'dotenv';
dotenv.config()
//express server setup
import express from "express"
const app = express();
const PORT = process.env.PORT || 3000;
const IP = process.env.IP || "localhost"
//path setup
import path from 'path'
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//cookie setup
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';

//multer setup  // parsing setup 
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({extended:true}))
app.use(cookieParser());
//mongodb setup
import  { connectToMongoDb } from "./services/connection.js";

//Routes setup

//views route name
// import adminRoutes from "./routes/view-routes/admin.route.js"
// import userRoutes from "./routes/view-routes/user.routes.js"
import staticRoutes from "./routes/view-routes/static.routes.js"

//Api routes name
// import adminApiRoutes from "./routes/api/v1/admin.route.js"
import userApiRoutes from "./routes/api/v1/user.routes.js"
import { handleUserAuthentication, isAdmin } from './middlewares/auth.middleware.js';

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, "..",'public')));




connectToMongoDb(`${process.env.MONGO_DB_URL}`);

//API routes
app.use("/api/v1/user",userApiRoutes)

// only activate when manipulating stocks and product
// app.use("/api/v1/admin",adminApiRoutes)
  

//View routes
// app.use("/admin",handleUserAuthentication,isAdmin,adminRoutes)
// app.use("/user",userRoutes)
app.use("/",staticRoutes)



app.listen(PORT, () => {
    console.log(`Server started on http://${IP}:${PORT}`)
  ;
});