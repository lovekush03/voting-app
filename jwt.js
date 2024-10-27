const jwt = require("jsonwebtoken");

const jwtAuthMiddleware = (req,res,next) => {
    //Check whether req header has authorization
    const authorization = req.header("Authorization");

    if(!authorization) return res.status(401).json({"error":"token not found"});

    //Extract token from request header
    const token = req.header('Authorization').split(" ")[1];

    if(!token){
        return res.status(401).json({error:"Unauthorized"});
    }
    //If token found, then verify the token
    try{
        const decodedPayload = jwt.verify(token,process.env.JWT_KEY);

        //Attach the user information to the req object
        req.Payload = decodedPayload;
        next();
    }catch(err){
        console.log(err);
        res.status(404).json({error:"Invalid Token"});
    }
}

//Generate JWT Token Function
const generateToken = (userData) => {
    return jwt.sign(userData,process.env.JWT_KEY);
}

module.exports = {jwtAuthMiddleware, generateToken};