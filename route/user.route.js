const express = require("express")
require("dotenv").config()
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { UserModel } = require("../model/user.model");
const { authMiddleware } = require("../middleware/auth");
const { AppointmentModel } = require("../model/appointment.model");
const redis = require("ioredis");
var cron = require('node-cron');
const ObjectsToCsv = require('objects-to-csv');
const userRoute = express.Router()

const SALT_ROUND = Number(process.env.SALT_ROUND);




const data = [
    {Totalnumberofdoctors: UserModel.find({"role":"doctor"}).count()},
    { Totalnumberofpatients: UserModel.find({"role":"patient"}).count()},
    {Totalnumberofappointments: UserModel.countDocuments()},
  ];


  (async () => {
    const csv = new ObjectsToCsv(data);
   
    // Save to file:
    await csv.toDisk('./report.csv');
   
    // Return the CSV file as string:
    console.log(await csv.toString());
  })();


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
        const patientData= await AppointmentModel.create({...req.body,appointmentDateTime:appointmentDateTime,patientId:req.userId})
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
//PUT /patient/appointments/:id → Update appointment details (only if more than 24 hours remain)

userRoute.put("/patient/appointments/:id",authMiddleware("patient"),async(req,res)=>{
    try{
    const id=req.params.id;
    const userId=req.patientId;
    const patientData= await AppointmentModel.find({userId})

    if(!patientData){
        res.status(200).json({ "msg":"patient Appointment data is not found.",patientData})
    }

    const currentDateTime=new Date()
    console.log(currentDateTime)
   // const appointmentdate=new Date(patientData.appointmentDateTime)
    //console.log(appointmentdate)
    const timeDifference=(new Date(patientData.appointmentDateTime) - currentDateTime)/(1000*60*60)
    if(timeDifference<24){
        res.status(200).json({ "msg":"Appointment can only updated only 24 hour remain."})
    }
    const Data= await AppointmentModel.findByIdAndUpdate(id,req.body,{new:true})
    res.status(200).json({ "msg":"Appointment updated successfully",Data})   
    }catch (error) {
       console.log(error)
        res.status(500).json({ "msg": "something went wrong while updating appointment.", error })
    }
})


cron.schedule('*/2 * * * *',async () => {
    const cacheddata=await redis.get("deleteRequest")
    let parsedCachedData=JSON.parse(cacheddata)
    await AppointmentModel.deleteMany(parsedCachedData)
    console.log('appointments deleted. cronjob is working');
  });


userRoute.post("/patient/appointments/request-delete/:id",authMiddleware("admin"),async(req,res)=>{
    try{
        const id=req.params.id;
        const cachedkey="deleteRequest"
        const cacheddata=await redis.get(cachedkey)

        if(cacheddata){
           
            let parsedCachedData=JSON.parse(cacheddata)
            res.status(200).json({ parsedCachedData })
        }
        else{
            const parsed=[req.body];
            await redis.set(cachedkey,JSON.stringify(deleteRequest),"EX",200)
        }
       
    }catch (error) {
       console.log(error)
        res.status(500).json({ "msg": "something went wrong.", error })
    }
})


////////////////////////////////***********  Doctor Routes  ***********///////////////////////////////
userRoute.get("/doctor/appointments",authMiddleware("doctor"),async(req,res)=>{
    try{
        const userId=req.doctorId;
        const AppData= await AppointmentModel.find({userId})
        if(!AppData){
            res.status(200).json({ "msg":"user not found."})
        }else{
        res.status(200).json({ "msg":"booked Appointment list",data:AppData})
           
        }
    }catch (error) {
       console.log(error)
        res.status(500).json({ "msg": "something went wrong in get appointment list.", error })
    }
})




userRoute.put("/doctor/appointments/:id",authMiddleware("doctor"),async(req,res)=>{
    try{
    const id=req.params.id;
    const userId=req.patientId;
    const AppointmentData= await AppointmentModel.find({userId})

    if(!AppointmentData){
        res.status(200).json({ "msg":"patient Appointment data is not found.",AppointmentData})
    }
    const currentDate=new Date()
    console.log(currentDateTime)
    const appointmentDate=(new Date(patientData.appointmentDateTime))
    if(currentDate>appointmentDate){
    const Data= await AppointmentModel.findByIdAndUpdate(id,req.body,{new:true})
    res.status(200).json({ "msg":"Appointment updated successfully",Data})   
    }}catch (error) {
       console.log(error)
        res.status(500).json({ "msg": "something went wrong while updating appointment.", error })
    }
})


////////////////////////////////***********  Admin Routes  ***********///////////////////////////////

userRoute.get("/admin/users",authMiddleware("admin"),async(req,res)=>{
    try{
       
        const AppData= await AppointmentModel.find()
        if(!AppData){
            res.status(200).json({ "msg":"user not found."})
        }else{
        res.status(200).json({ "msg":"Admn can view all users data :",data:AppData})
           
        }
    }catch (error) {
       console.log(error)
        res.status(500).json({ "msg": "something went wrong in get appointment list.", error })
    }
})

userRoute.get("/admin/users/:id",authMiddleware("admin"),async(req,res)=>{
    try{
       
        const id=req.params.id
        const AppData= await AppointmentModel.find({id})
        if(!AppData){
            res.status(200).json({ "msg":"user not found."})
        }else{
        res.status(200).json({ "msg":"user list",data:AppData})
           
        }
    }catch (error) {
       console.log(error)
        res.status(500).json({ "msg": "something went wrong in get appointment list.", error })
    }
})
userRoute.delete("/admin/users/:id",authMiddleware("admin"),async(req,res)=>{
    try{
       
        const id=req.params.id
        const AppData= await AppointmentModel.find({id})
        if(!AppData){
            res.status(200).json({ "msg":"user not found."})
        }else{
            const AppData1= await AppointmentModel.findByIdAndDelete({id})
        res.status(200).json({ "msg":"user deleted"})
           
        }
    }catch (error) {
       console.log(error)
        res.status(500).json({ "msg": "something went wrong in get appointment list.", error })
    }
})

userRoute.get("/admin/users/:id",authMiddleware("admin"),async(req,res)=>{
    try{
       
        const id=req.params.id
        const AppData= await AppointmentModel.find({id})
        if(!AppData){
            res.status(200).json({ "msg":"user not found."})
        }else{
        res.status(200).json({ "msg":"appointment list",data:AppData})
           
        }
    }catch (error) {
       console.log(error)
        res.status(500).json({ "msg": "something went wrong in get appointment list.", error })
    }
})

// DELETE /admin/appointments/:id → Delete an appointment
// GET /admin/reports → Download a CSV file containing system statistics

userRoute.delete("/admin/appointments/:id",authMiddleware("admin"),async(req,res)=>{
    try{
       
        const id=req.params.id
        const AppData= await AppointmentModel.find({id})
        if(!AppData){
            res.status(200).json({ "msg":"user not found."})
        }else{
            const AppData1= await AppointmentModel.findByIdAndDelete({id})
        res.status(200).json({ "msg":"appointment deleted deleted"})
           
        }
    }catch (error) {
       console.log(error)
        res.status(500).json({ "msg": "something went wrong in get appointment list.", error })
    }
})









module.exports = { userRoute }