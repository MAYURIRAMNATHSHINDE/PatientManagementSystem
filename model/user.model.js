const mongoose = require("mongoose");



const UserSchema = new mongoose.Schema(
    {
        name: {type:String},  //req.body
        email: {type:String,unique:true},     //req.body
        mobileNumber: {type:String},           //req.body
        password: {type:String},                //req.body and hashed
        role: {type:String,enum:["admin", "doctor", "patient"],default:"patient"},          //req.body
        specialization: {type:String,enum:["nerves", "heart", "skin","lungs"]},     //(only for doctors)
        availableDays: {type:Array,days:{type:String,enum:[["Sun", "Mon", "Tue","Wed", "Thu", "Fri", "Sat"]]}}    ////(only for doctors)     //(only for doctors)
    }
)


const UserModel = mongoose.model("user", UserSchema)

module.exports = { UserModel }