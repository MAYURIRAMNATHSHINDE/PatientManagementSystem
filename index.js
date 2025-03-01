const express=require("express")
const { ConnectToDB } = require("./config/mongo.config")
require("dotenv").config()



const app=express()


PORT=process.env.PORT || 8080



app.listen(PORT,()=>{
    ConnectToDB()
    console.log("server is running on port 8080")
})