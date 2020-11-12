//jshint esverion:6

const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');

const app = express();

app.set('view engine','ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));



app.get('/', (req, res) => {
  res.render("index");
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/signup', (req, res) => {
  res.render('signup');
});


app.listen(8080, function(){
  console.log("Server running at port 8080");
});