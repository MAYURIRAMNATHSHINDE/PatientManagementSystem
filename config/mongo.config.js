const mongoose= require("mongoose");
require("dotenv").config()

const ConnectToDB=async()=>{
    try{
        await mongoose.connect(process.env.MONGO_URI)
        console.log("Connected to Database.")
    }catch(error){
        console.log("error occured in DB connection.")
    }
}



module.exports={ConnectToDB}