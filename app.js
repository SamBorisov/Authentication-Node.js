require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const { config } = require('dotenv');

//bcrypt
const bcrypt = require("bcrypt");
const saltRounds = 10;


//setup
const app = express();
app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

mongoose.set('strictQuery', false);
mongoose.connect("mongodb://127.0.0.1:27017/userDB", { useNewUrlParser: true })

//
const userSchema = new mongoose.Schema ({
    email: String,
    password: String
  })


const User = mongoose.model("User", userSchema);


//routs
app.route("/")
    .get((req,res) => {
        res.render("home")
    });


app.route("/login")
  .get((req,res) => {
      res.render("login")
  })
  .post((req,res)=> {

    username = req.body.username;
    password = req.body.password;
    

    
    User.findOne({email: username}, (err, result) => {
        console.log("userFound")
        if(result) {
            bcrypt.compare(password, result.password, function(err, result1) {
                if (result1 === true) {
                    res.render("secrets")
                }
            });
        } else {
            console.log(result.username)
        }})
  });


app.route("/register")
    .get((req,res) => {
        res.render("register")
    })
    .post((req,res) => {

        bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
                const newUser = new User({
                    email: req.body.username,
                    password: hash
                });
                newUser.save((err) => {
                    if(!err) {
                        res.render("secrets")
                    } else {
                        console.log(password)
                    }
                })
            });
        });

   














//Port
app.listen(3000);
