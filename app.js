//jshint esverion:6

require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');
const bcrypt = require('bcrypt');
const saltRounds = 11;
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const { removeAllListeners } = require('nodemon');


const app = express();

app.use(express.static("public"));
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(session({
  secret: "ThisIsASecretHheheheSHHHHHHHKeepQuite!!!",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect('mongodb://localhost:27017/classDB', {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set('useCreateIndex', true);

const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model('User', userSchema);

passport.use(User.createStrategy());
 
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get('/', (req, res) => {
  res.render("index");
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/signup', (req, res) => {
  res.render('signup');
});

app.get('/home', function(req, res){
  if(req.isAuthenticated()){
    res.render('home');
  }
  else {
    res.redirect('/login');
  }
});

app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
})

app.post('/signup', (req, res) => {
  User.register({username: req.body.username}, req.body.password, (err, user) => {
    if(err){
      console.log(err);
      res.render('/signup');
    } else {
      passport.authenticate("local")(req, res, () => {
        res.redirect('/home');
      });
    }
  });

});

app.post("/login", (req, res) => {
  const user = new User({
    username: req.body.username,
    password: req.body.password
  });

  req.login(user, function(err){
    if(err){
      console.log(err);
      res.render('/login');
    } else {
      passport.authenticate('local')(req, res, () => {
        res.redirect('/home');
      });
    }
  })

});


app.listen(8080, function(){
  console.log("Server running at port 8080");
});