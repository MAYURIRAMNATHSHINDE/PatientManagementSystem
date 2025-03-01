const express = require("express")
require("dotenv").config()
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { UserModel } = require("../model/user.model");
const { authMiddleware } = require("../middleware/auth");
const { AppointmentModel } = require("../model/appointment.model");


const userRoute = express.Router()

const SALT_ROUND = Number(process.env.SALT_ROUND);



////////////////////******** SignUp Route ************///////////////////////
userRoute.post("/auth/register", async (req, res) => {

    try {
        let OriginalPassword = req.body.password;
        bcrypt.hash(OriginalPassword, SALT_ROUND, async function (err, hash) {
            if (err) {
                res.status(500).json({ "msg": "error occured while hashing password", err })
            } else {
                const userData = await UserModel.create({ ...req.body, password: hash })
                res.status(201).json({ "msg": "You have Registerd Successfully..." })
            }
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({ "msg": "register route failed...", error })
    }
})

////////////////////******** Login Route ************///////////////////////

userRoute.post("/auth/login", async (req, res) => {

    try {
        const user = await UserModel.findOne({ email: req.body.email })
        if (!user) {
            res.status(404).json({ "msg": "User not found,please register"})
        } else {

            let OriginalPassword=req.body.password;
            let hashedPassword=user.password;
            bcrypt.compare(OriginalPassword, hashedPassword, async function(err, result) {
                if(err){
                    res.status(404).json({ "msg": "wrong password,please enter correct password!" })
                }else{
                    var token = jwt.sign({ userId:user._id,role:user.role }, process.env.SECRET_KEY,{ expiresIn: "20min"});
                    res.status(200).json({ "msg": "You have LogedIn Successfully...",token})
                }
            })   
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({ "msg": "login route failed...", error })
    }
})

////////////////////////////////***********  Patient Routes  ***********///////////////////////////////

userRoute.post("/patient/appointments",authMiddleware("patient"),async(req,res)=>{
    try{
        const appointmentDateTime=new Date()
        const patientData= await AppointmentModel.create({...req.body,appointmentDateTime:appointmentDateTime})
        res.status(200).json({ "msg":"Appointment bookes successfully",patientData})
    }catch (error) {
       console.log(error)
        res.status(500).json({ "msg": "something went wrong.", error })
    }
})



userRoute.get("/patient/appointments",authMiddleware("patient"),async(req,res)=>{
    try{
        const userId=req.patientId;
        const patientData= await AppointmentModel.find({userId})
        if(!patientData){
            res.status(200).json({ "msg":"user not found."})
        }else{
        res.status(200).json({ "msg":"booked Appointment list",data:patientData})
           
        }
    }catch (error) {
       console.log(error)
        res.status(500).json({ "msg": "something went wrong in get appointment list.", error })
    }
})




/*
Admin Routes
GET /admin/users → View all users
GET /admin/users/:id → View a specific user
DELETE /admin/users/:id → Delete a user
GET /admin/appointments → View all appointments
DELETE /admin/appointments/:id → Delete an appointment
GET /admin/reports → Download a CSV file containing system statistics
Doctor Routes
GET /doctor/appointments → View all appointments assigned to the doctor
PUT /doctor/appointments/:id → Update fees, prescription, and isDiagnosisDone (after appointment date)
Patient Routes

GET /patient/appointments → View all booked appointments
PUT /patient/appointments/:id → Update appointment details (only if more than 24 hours remain)
POST /patient/appointments/request-delete/:id → Request admin to delete an appointment (stored in Redis)

*/





module.exports = { userRoute }