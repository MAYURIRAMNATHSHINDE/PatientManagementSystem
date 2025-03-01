const express=require("express")
const { ConnectToDB } = require("./config/mongo.config")
const { userRoute } = require("./route/user.route")
require("dotenv").config()



const app=express()
app.use(express.json())
app.use("/user",userRoute)
PORT=process.env.PORT || 8080
app.use(LoggerMiddleware)


app.listen(PORT,()=>{
    ConnectToDB()
    console.log("server is running on port 8080")
})