const express = require("express")
require("dotenv").config()
var jwt = require('jsonwebtoken');
const fs=require("fs")
const authMiddleware = (role) => {
    return (req, res, next) => {
        const token = req.headers.authorization.split(" ")[1];
        console.log(token);
        try {
            if (!token) {
                res.status(403).json({ "msg": "User Not loggedIn." })
            } else {
                var decoded = jwt.verify(token, process.env.SECRET_KEY);
                if(decoded){
                    req.userId=decoded.userId;
                    req.role=decoded.role;
                    console.log(decoded.userId);
                    console.log(decoded.role)
                    next()
                }else{
                    res.status(401).json({ "msg": "Unauthorized"})
                }
            }
        } catch (err) {
            console.log(err)
            res.status(500).json({ "msg": "error occured in auth.", err})
        }

    }
}

const LoggerMiddleware=(req,res,next)=>{ 
    let LogedData=`${req.method} ${req.url}`;
    fs.appendFileSync("log.txt",LogedData)
    next()
}
module.exports={authMiddleware,LoggerMiddleware}