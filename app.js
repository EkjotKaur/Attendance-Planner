//jshint esverion:6

const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');

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
  password: String
});

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

app.post('/signup', function(req, res){
  const newBatch = new Batch({
    tchName: req.body.teacher,
    email: req.body.email,
    batch: req.body.batch,
    subject: req.body.subject,
    password: req.body.password
  });

  newBatch.save(err => {
    if(err){
      console.log(err);
    } else {
      res.render("index");
    }
  });
});


app.listen(8080, function(){
  console.log("Server running at port 8080");
});