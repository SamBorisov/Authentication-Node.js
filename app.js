const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose")

//setup
const app = express();
app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

mongoose.set('strictQuery', false);
mongoose.connect("mongodb://127.0.0.1:27017/userDB", { useNewUrlParser: true })

//
const userSchema = {
    email: String,
    password: String
  }
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

    User.findOne({email: req.body.username, password: req.body.password}, (err, result) => {
        if(result) {
            res.render("secrets")
        } else {
            res.send("bad login")
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
                console.log(err)
            }
        })
    });














//Port
app.listen(3000);
