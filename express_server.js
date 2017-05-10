var express = require("express");
var app = express();
var cookieParser = require('cookie-parser');

var PORT = process.env.PORT || 8080;


app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/urls/new", (req, res) => {
  let templateVars = { username: req.cookies['username'] };
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body);
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect('urls/' + shortURL);
});

app.post("/login", (req, res) => {
  res.cookie('username', req.body.login);
  res.redirect('/urls/');
});

app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls/');
});


app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

app.post("/urls/:id/update", (req, res) => {
  urlDatabase[req.params.id] = req.body.newlongURL;
  res.redirect('/urls');
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/urls", (req, res) => {
  let templateVars = { username: req.cookies['username'], urls: urlDatabase };
  res.render('urls_index', templateVars);
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { username: req.cookies['username'], shortURL: req.params.id, urls: urlDatabase };
  res.render("urls_show", templateVars);
});


app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString() {
  let result = '';
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let i = 6; i > 0; --i) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}














