//jshint esversion:6
//require packages
require("dotenv").config();
const express = require("express");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

//create new express app
const app = new express();

//enable ejs as the view engine
app.set("view engine", "ejs");

//enable express to access atatic files in a folder called "public"
app.use(express.static("public"));

//enable express to parse URL-encoded body ie. info from HTML form
app.use(express.urlencoded({extended: true}));

//connect to MongoDB asynchronously
main().catch(err => console.log(err));

async function main() {
  await mongoose.connect("mongodb://localhost:27017/userDB");
};

//create SCHEMA with document fields and datatypes
const userSchema = new mongoose.Schema({
  email: {type: String},
  password: {type: String}
});

//use basic secret string instend of passing in two keys for now
//only encrypt password as you cannot find on an encrypted field
//const secret = "Thisisourlittlesecret.";
//userSchema.plugin(encrypt, {secret: secret, encryptedFields: ["password"] });
userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ["password"] });


//create a MODEL from the SCHEMA...the MODEL is usually capitolized and in
//the singular form. mongoose automatically creates the collection
//from the model...first parm "User"... by lower-casing the first letter and
//making it plural ie. users
const User = new mongoose.model("User", userSchema);


app.get("/", function(req, res){
  res.render("home");
});

app.get("/login", function(req, res){
  res.render("login");
});

app.get("/register", function(req, res){
  res.render("register");
});


app.post("/register", function(req, res){
  const newUser = new User({
    email: req.body.username,
    password: req.body.password
  });

  newUser.save(function(err, result){
    if (err){
      console.log(err);
    } else {
      res.render("secrets");
    }
  });
});

app.post("/login", function(req, res){
  const username = req.body.username;
  const password = req.body.password;

  User.findOne({email: username}, function(err, foundUser){
    if (err) {
      console.log(err);
    } else {
      if (foundUser){
        if (foundUser.password === password){
          res.render("secrets");
        }
      }
    }
  });
});


//start server
app.listen(3000, function(){
  console.log("Server started on port 3000.")
});
