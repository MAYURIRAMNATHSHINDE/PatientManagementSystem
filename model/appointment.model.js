const mongoose = require("mongoose");


const AppointmentSchema = new mongoose.connect(
    {
        patientId: {type:mongoose.Schema.Types.ObjectId,ref:"user"},           // Reference to User (patient)
        doctorId: {type:mongoose.Schema.Types.ObjectId,ref:"user"},             //doctorId: Reference to User (doctor)
        appointmentDateTime: {type:DateTime},                                  //req.body
        symptoms: {type:String},                                                  //req.body 
        fees: {type:Number},                                                     // (updated by doctor after appointment)
        prescription: {type:String,enum:["nerves", "heart", "skin","lungs"]},     //(updated by doctor after appointment)
        isDiagnosisDone: {type:Boolean,enum:[["Sun", "Mon", "Tue","lungs"]]}         //(updated by doctor after appointment)
    }
)


const AppointmentModel = mongoose.model("user", AppointmentSchema)

module.exports = { AppointmentModel }

