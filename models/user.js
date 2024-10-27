const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

//Defin User Schema
const userSchema = new mongoose.Schema({
    name : {
        type : String,
        required: true
    },
    age : {
        type : Number,
        required : true
    },
    email : {
        type : String
    },
    mobile : {
        type : String
    },
    address : {
        type : String,
        required : true
    },
    aadharCardNumber:{
        type : Number,
        required : true,
        unique : true
    },
    password: {
        type:String,
        required:true
    },
    role:{
        type:String,
        enum : ["voter","admin"],
        default : "voter"
    },
    isVoted : {
        type: Boolean,
        default: false
    }
})

userSchema.pre('save', async function(next) {
    const user = this;
    // Hash the password only if it is modified or if it is new
    if (!user.isModified('password')) return next();
    try {
        // Generate salt
        const salt = await bcrypt.genSalt(10);
        // Hash the password
        user.password = await bcrypt.hash(user.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

userSchema.methods.comparePassword = async function(candidatePassword){
    try{
        const isMatched = await bcrypt.compare(candidatePassword,this.password);
        return isMatched;
    }catch(err){
        throw(err);
    }
}

const User = mongoose.model("User",userSchema);
module.exports = User;