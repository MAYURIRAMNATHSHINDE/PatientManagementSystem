const mongoose = require("mongoose");


const UserSchema = new mongoose.connect(
    {
        name: {type:String},  //req.body
        email: {type:String,unique:true},     //req.body
        mobileNumber: {type:String},           //req.body
        password: {type:String},                //req.body and hashed
        role: {type:String,enum:["admin", "doctor", "patient"],default:"patient"},          //req.body
        specialization: {type:String,enum:["nerves", "heart", "skin","lungs"]},     //(only for doctors)
        availableDays: {type:Array,enum:[["Sun", "Mon", "Tue","lungs"]]}         //(only for doctors)
    }
)


const UserModel = mongoose.model("user", UserSchema)

module.exports = { UserModel }