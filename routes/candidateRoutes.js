const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
require("dotenv").config();
const User = require("./../models/user");
const Candidate = require("./../models/candidate");
const {jwtAuthMiddleware, generateToken} = require("./../jwt");

//Function to Check whether the user is admin or not
const checkAdmin = async(userId) => {
    try{
        const user = await User.findById(userId);
        return user.role === "admin";
    }catch(err){
        return false;
    }
}

//GET Route for Displaying List of Candidates
router.get("/",async(req,res) => {
    try{
        //Data of all Candidates
        const candidates = await Candidate.find();
        //Display only required data of candidates
        const candidateRecord = candidates.map((candidate) => {
            return {
                party:candidate.party,
                name:candidate.name,
                age:candidate.age
            }
        })
        console.log("Candidates Displayed");
        res.status(200).json(candidateRecord);
    }catch(err){
        console.log(err);
        res.status(500).json({error:"Internal Server Error"});
    }
})
//POST Route for candidate creation
router.post("/",jwtAuthMiddleware, async(req,res) => {
    try{
        if(!await checkAdmin(req.Payload.id)){
            return res.status(403).json({error:"User cannot access Candidate Information"});
        }
        const data = req.body;  //Take data entered by the candidate
        const newCandidate = new Candidate(data);  //Create a candidate using data passed
        const response = await newCandidate.save();  //Save the new Candidate Data in the DB
        console.log("Data Saved");
        res.status(200).json({response});
    }catch(err){
        console.log(err);
        res.status(500).json({error:"Internal Server Error"});
    }
})

//Put Route to Change the candidate information using candidateID
router.put("/:candidateId",jwtAuthMiddleware, async(req,res) => {
    try{
        if(!await checkAdmin(req.Payload.id)){
            return res.status(403).json({error:"User Cannot Access Candidate Info"});
        }

        const candidateId = req.params.candidateId;
        const updatedCandidateData = req.body;
        const response = await Candidate.findByIdAndUpdate(candidateId,updatedCandidateData,{
            new:true,     //Return new Candiate object
            runValidators: true   //Run mongoose Validators
        })

        if(!response){
            return res.status(404).json({error:"Candidate Not Found"});
        }
        console.log("Candidate Data Updated");
        res.status(200).json({response});
    }catch(err){
        console.log(err);
        res.status(500).json({error:"Internal Server Error"});
    }
})

//Delete Route to Delete any Candidate
router.delete("/:candidateId",jwtAuthMiddleware, async(req,res) => {
    try{
        if(!await checkAdmin(req.Payload.id)){
            return res.status(403).json({error:"User Cannot access Candidate Info"});
        }
        const deleteCandidateId = req.params.candidateId;
        const response = await Candidate.findByIdAndDelete(deleteCandidateId);
        if(!response)
            return res.status(404).json({error:"Candidate Not Found"});
        console.log("Candidate Deleted");
        res.status(200).json({response});
    }catch(err){
        console.log(err);
        res.status(500).json({error:"Internal Server Error"});
    }
})

//lets start voting
router.post("/vote/:candidateId",jwtAuthMiddleware,async(req,res) => {
    //no admin can vote
    //user can vote only once

    const candidateId = req.params.candidateId;
    const userId = req.Payload.id;

    try{
        const userData = await User.findById(userId);
        if(!userData){
            return res.status(404).json({messsage:"User Not Found"});
        }
        if(userData.role === "admin"){
            return res.status(403).json({error:"Admin cannot vote"});
        }
        if(userData.isVoted){
            return res.status(400).json({error:"One User Can only vote once"});
        }
        //Find the Candidate
        const candidateData = await Candidate.findById(candidateId);
        if(!candidateData) return res.status(404).json({messsage:"Candidate Not Found"});
        
        candidateData.votes.push({user:userId});
        candidateData.voteCount++;
        await candidateData.save();

        //update the user Document
        userData.isVoted = true;
        await userData.save();

        res.status(200).json({message:"Vote Recorded Successfully"});
    }catch(err){
        console.log(err);
        res.status(500).json({error:"Internal Server Error"});
    }
})

//vote count
router.get("/vote/count",async(req,res) => {
    try{
        //Fetch Data of all Candidates in descending order of voteCount
        const candidates = await Candidate.find().sort({voteCount:"desc"});
        //only show the party name along with the voteCount don't show the whole data
        const voteRecord = candidates.map((candidate) => {
            return {
                PartyName:candidate.party,
                VoteCount: candidate.voteCount
            };
        })
        res.status(200).json(voteRecord);
    }catch(err){
        console.log(err);
        res.status(500).json({error:"Internal Server Error"});
    }
})
module.exports = router;