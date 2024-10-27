const express = require("express");
const router = express.Router();
const User = require("./../models/user");
const {jwtAuthMiddleware, generateToken} = require("./../jwt");

//Function used in signup route to check there is no admin created
const checkAdminCount = async() => {
    try{
        const allAdminData = await User.findMany({role:"admin"});
        return allAdminData.length === 0
    }catch(err){
        console.log(err);
        return err
    }
}

//POST Route to add a user signup route
router.post('/signup', async(req,res) => {
    try{
        const data = req.body;   //req.body contain the data entered by user
        const newUser = new User(data);    // model the given data in form of user schema
        if(newUser.role === "admin" && !await checkAdminCount()){
            return res.status(403).json({error:"There is only one admin allowed"});
        }
        const response = await newUser.save();   //Save the new user to the database
        const payload = {
            id : response.id
        }
        console.log(JSON.stringify(payload));
        const token = generateToken(payload);  // generate jwt token for the user
        console.log("Token is: ",token);

        res.status(200).json({response:response, token:token});
    }catch(err){
        console.log(err);
        res.status(500).json({error:"Internal Server Error"});
    }
})
//POST Route for login an existing user  /login
router.post("/login", async(req,res) => {
    try{
        const {aadharNumber,password} = req.body;
        //Check whether user with given aadharNumber is present or not
        const existingUser = await User.findOne({aadharCardNumber:aadharNumber});
        if(!existingUser){
            return res.status(401).json({"error":"User not found"});
        }
        //Check whether password is correct or not
        if(!await existingUser.comparePassword(password)){
            return res.status(401).json({"error":"Invalid Password"});
        }


        //User is Valid
        //provide user a jwt token
        const payload = {
            id : existingUser.id
        }
        const token = generateToken(payload);
        console.log("Token is: ",token);
        res.status(200).json({token:token});
    }catch(err){
        console.log(err);
        res.status(500).json({error:"Internal Server Error"});
    }
})
//GET Route for extracting user profile  /profile
router.get("/profile", async(req,res) => {
    try{
        //Extract user from the req object
        const user = req.Payload;
        //Fetch the full information about the user from db
        const userFromDB = await User.findById(user.id);
        res.status(200).json({response:userFromDB});
    }catch(err){
        console.log(err);
        res.status(500).json({error:"Internal Server Error"});
    }
})  
//PUT Route for changing the user password  /profile/password
router.put("/profile/password", async(req,res) => {
    try{
        const userId = req.Payload.id;    // extract user id from token
        const {currentPassword, newPassword} = req.body;  //extract new and current password from the body
        //Check whether user with given id is present or not
        const user = await User.findById(userId);
        if(!await user.comparePassword(currentPassword)){
            return res.status(404).json({error:"Invalid Password"});
        }
        //Change the password of the user
        user.password = newPassword;
        await user.save();

        console.log("Data Updated");
        res.status(200).json({user});
    }catch(err){
        console.log(err);
        res.status(500).json({error:"Internal Server Error"});
    }
})

module.exports = router