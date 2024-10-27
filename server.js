const express = require("express")
const app = express();
const db = require("./db");
require('dotenv').config();

const bodyParser = require("body-parser");
app.use(bodyParser.json());  //req.body
const PORT = 3000;

//Import Route files
const userRoutes = require("./routes/userRoutes");
const candidateRoutes = require("./routes/candidateRoutes");

//Use the Router
app.use("/user",userRoutes); 
app.use("/candidate",candidateRoutes);

app.listen(PORT,() => {
    console.log("Listening on port 3000");
})  

