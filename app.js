require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const { config } = require('dotenv');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-find-or-create')

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
    password: String,
    googleId: String,
    secret: String
  })

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);


const User = mongoose.model("User", userSchema);

passport.use(new LocalStrategy(User.authenticate()));
// use static serialize and deserialize of model for passport session support
passport.serializeUser(function(user, cb) {
    process.nextTick(function() {
      return cb(null, {
        id: user.id,
        username: user.username,
        picture: user.picture
      });
    });
  });
  
  passport.deserializeUser(function(user, cb) {
    process.nextTick(function() {
      return cb(null, user);
    });
  });

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log(profile);

    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));


//routs
app.route("/")
    .get((req,res) => {
        res.render("home")
    });


app.get("/auth/google",
  passport.authenticate('google', { scope: ["profile"] })
);
app.get('/auth/google/secrets', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect secrets.
    res.redirect('/secrets');
  });

// login page
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

//register page
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

// secret page
app.route("/secrets")
    .get((req,res)=> {
        User.find({"secret":{$ne: null}}, (err, result)=> {
            if (result) {
                res.render("secrets", {usersWithSecrets: result});
            }
        })
    });


    //logout 
app.get("/logout", (req,res)=> {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/');
      });
    });

//submit
app.route("/submit")
    .get((req,res) => {
    if (req.isAuthenticated()) {
        res.render("submit")
    } else {
        res.redirect("/login")
    } 
    })
    .post((req,res) => {
        const submittedSecret =  req.body.secret;

        User.findById(req.user.id, (err, result) => {
            if (result) {
                result.secret = submittedSecret;
                result.save(()=> {
                    res.redirect("/secrets")
                })
            }
        })
    });












//Port
app.listen(3000);
