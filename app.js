require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const { config } = require('dotenv');

//passport +
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const LocalStrategy = require('passport-local').Strategy;




//setup
const app = express();
app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
  //  cookie: { secure: true }
  }))
app.use(passport.initialize());
app.use(passport.session());

mongoose.set('strictQuery', false);
mongoose.connect("mongodb://127.0.0.1:27017/userDB", { useNewUrlParser: true })

// mongo schemas
const userSchema = new mongoose.Schema ({
    email: String,
    password: String
  })

userSchema.plugin(passportLocalMongoose);


const User = mongoose.model("User", userSchema);

passport.use(new LocalStrategy(User.authenticate()));
// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

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
    const user = new User ({
        username: req.body.username,
        password: req.body.password
    })
    req.login(user, (err)=>{
        if (err) {
            console.log(err);
        } else {
            passport.authenticate("local")(req, res , () => {
                res.redirect("/secrets")
        })  }
    })

  });


app.route("/register")
    .get((req,res) => {
        res.render("register")
    })
    .post((req,res) => {

        User.register({username: req.body.username}, req.body.password, (err, user) => {
            if (err) {
                console.log(err)
            } else {
                passport.authenticate("local")(req, res , () => {
                    res.redirect("/secrets")
                })
            }
        })
       
    });

app.route("/secrets")
    .get((req,res)=> {
        if (req.isAuthenticated()) {
            res.render("secrets")
        } else {
            res.redirect("/login")
        }
    });

app.get("/logout", (req,res)=> {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/');
      });
    });














//Port
app.listen(3000);
