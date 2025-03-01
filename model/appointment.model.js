const mongoose = require("mongoose");


const AppointmentSchema = new mongoose.Schema(
    {
        patientId: {type:mongoose.Schema.Types.ObjectId,ref:"user"},           // Reference to User (patient)
        doctorId: {type:mongoose.Schema.Types.ObjectId,ref:"user"},             //doctorId: Reference to User (doctor)
        appointmentDateTime: {type:Date},                                  //req.body
        symptoms: {type:String},                                                  //req.body 
        fees: {type:Number},                                                     // (updated by doctor after appointment)
        prescription: {type:String},     //(updated by doctor after appointment)
        isDiagnosisDone: {type:Boolean}         //(updated by doctor after appointment)
    }
)


const AppointmentModel = mongoose.model("appointment", AppointmentSchema)

module.exports = { AppointmentModel }

