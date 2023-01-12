require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");
const { config } = require('dotenv');

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

  const encKey = process.env.SOME_32BYTE_BASE64_STRING;
  const sigKey = process.env.SOME_64BYTE_BASE64_STRING;


userSchema.plugin(encrypt, {secret: process.env.SECRET , encryptedFields: ['password'] });

const User = mongoose.model("User", userSchema);

console.log(process.env.SECRET)

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
            if ( result.password === password) {
                res.render("secrets")
            }
        } else {
            console.log(result.username)
        }})
  });


app.route("/register")
    .get((req,res) => {
        res.render("register")
    })
    .post((req,res) => {
        const newUser = new User({
            email: req.body.username,
            password: req.body.password
        });
        newUser.save((err) => {
            if(!err) {
                res.render("secrets")
            } else {
                console.log(password)
            }
        })
    });














//Port
app.listen(3000);
