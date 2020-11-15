//jshint esverion:6

require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const findOrCreate = require('mongoose-findorcreate');

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

mongoose.connect('mongodb+srv://admin-EkjotKaur:Test123@attendance.e3ui6.mongodb.net/attendanceDB', {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});

mongoose.set('useCreateIndex', true);

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String
});

const classSchema = {
  branch: String,
  Shift: String,
  year: String,
  subject: String,
  userId: String,
};

const slotSchema = {
  branch: String,
  Shift: String,
  year: String
}

const studentSchema = {
  enrollNo: String,
  name: String,
  branch: String,
  Shift: String,
  year: String,
  present: Number,
  slotId: String
}

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model('User', userSchema);
const Class = mongoose.model('Class', classSchema);
const Slot = mongoose.model('Slot', slotSchema);
const Student = mongoose.model('Student', studentSchema);

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
    Class.find({userId: req.user.id}, (err, classes) => {
      if(err){
        console.log(err);
      } else {
        res.render('home',{
          classList: classes,
          name: req.user.name 
        });
      }
    });
  }
  else {
    res.redirect('/login');
  }
});

app.get('/newclass', (req, res) => {
 if(req.isAuthenticated()){
  res.render('newClass');
  } else {
    res.redirect('/login');
  }
});

app.get('/:presentClassId/updateClass', (req, res) => {
  if(req.isAuthenticated()){
    res.render('updateClass', {presentClassId: req.params.presentClassId});
  } else {
    res.redirect('/login');
  }
});

app.get('/:presentClassId/attendance', (req, res) => {
  if(req.isAuthenticated()){
    res.render('attendance', {presentClassId: req.params.presentClassId});
  } else {
    res.redirect('/login');
  }
});

app.get('/:presentClassId/newStudent', (req, res) => {
  if(req.isAuthenticated()){
    res.render('newStudent');
  } else {
    res.redirect('/login');
  }
});

app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

app.post('/signup', (req, res) => {
  User.register({name: req.body.name, username: req.body.username}, req.body.password, (err, user) => {
    if(err){
      console.log(err);
      res.render('signup');
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

app.post('/newclass', (req, res) => {
  const batch = new Class({
    branch: req.body.branch,
    Shift: req.body.Shift,
    year: req.body.year,
    subject: req.body.subject,
    userId: req.user.id 
  });

  batch.save();
  res.redirect('home');
});

app.post('/:presentClassId/updateClass', (req, res) => {
  Class.findOneAndUpdate({_id: req.params.presentClassId}, {subject: req.body.subject}, (err, updatedBatch) => {
    if(err){
      console.log(err);
    } else {
      res.redirect('/home');
    }
  });
});

app.post('/:presentClassId/deleteClass', (req, res) => {
  Class.findByIdAndDelete({_id: req.params.presentClassId}, (err, deletedClass) => {
    if(err){
      console.log(err);
    } else {
      res.redirect('/home');
    }
  });
});

app.listen(8080, function(){
  console.log("Server running at port 8080");
});