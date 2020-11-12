//jshint esverion:6

require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');

const app = express();

app.use(express.static("public"));
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

mongoose.connect('mongodb://localhost:27017/classDB', {useNewUrlParser: true, useUnifiedTopology: true});

const batchSchema = new mongoose.Schema({
  tchName: String,
  email: String,
  batch: String,
  subject: String,
  username: String,
  password: String
});

batchSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ['password']});

const Batch = mongoose.model('Batch', batchSchema);

app.get('/', (req, res) => {
  res.render("index");
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/signup', (req, res) => {
  res.render('signup');
});

app.post('/signup', (req, res) => {
  const newBatch = new Batch({
    tchName: req.body.teacher,
    email: req.body.email,
    batch: req.body.batch,
    subject: req.body.subject,
    username: req.body.username,
    password: req.body.password
  });

  newBatch.save(err => {
    if(err){
      console.log(err);
    } else {
      res.render("home");
    }
  });
});

app.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  Batch.findOne({username: username}, (err, foundUser) => {
    if(err){
      console.log(err);
    } else {
      if(foundUser){
        if(foundUser.password === password){
          res.render("home");
        }
      }
    }
  });
});


app.listen(8080, function(){
  console.log("Server running at port 8080");
});