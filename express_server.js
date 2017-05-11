var express = require("express");
var app = express();
var cookieParser = require('cookie-parser');

var PORT = process.env.PORT || 8080;

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}

app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

var urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    creator: "userRandomID"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    creator: "userRandomID"
  },
};

app.post("/register", (req, res) => {
  let userID = generateRandomString(10);
  let alreadyregistered = false;
  for (user in users) {
    if (users[user].email === req.body.email) {
      alreadyregistered = true;
    }
  };
  if (!req.body.email || !req.body.password) {
    console.log('empty error');
    res.status(400);
    res.send('Email or Password cannot be empty.');
  }
  if (alreadyregistered) {
    console.log('repeat error');
    res.status(400);
    res.send('Email already registered.');
  }

  users[userID] = {id: userID, email: req.body.email, password: req.body.password};
  console.log(users);
  res.cookie('user_id', userID);
  res.redirect('urls/');
});

app.get("/urls/new", (req, res) => {
  let templateVars = { user: users[req.cookies['user_id']] };
  if (!(req.cookies.user_id)) {
    res.redirect('/login');
  }
  console.log(req.body.user_id)
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body);
  let shortURL = generateRandomString(6);
  urlDatabase[shortURL] = { longURL: req.body.longURL, creator: req.cookies.user_id};
  res.redirect('urls/' + shortURL);
});

app.post("/login", (req, res) => {
  let alreadyregistered = false;
  let userID = '';
  for (var user in users) {
    if (users[user].email === req.body.email) {
      alreadyregistered = true;
      userID = user;
    }
  }
  if (!alreadyregistered) {
    res.status(403);
    res.send('Email not found.');
  }

  if (!(users[userID].password === req.body.password)) {
    res.status(403);
    res.send('Incorrect password.');
  }
  res.cookie('user_id', userID);
  res.redirect('/urls/');
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls/');
});


app.post("/urls/:id/delete", (req, res) => {
  if (urlDatabase[req.params.id].creator === req.cookies.user_id) {
    delete urlDatabase[req.params.id];
  }
  res.redirect('/urls');
});

app.post("/urls/:id/update", (req, res) => {
  if (urlDatabase[req.params.id].creator === req.cookies.user_id){
    urlDatabase[req.params.id].longURL = req.body.newlongURL;
  }
  res.redirect('/urls');
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/register", (req, res) => {
  let templateVars = { user: users[req.cookies['user_id']]};
  res.render("register_show", templateVars);
});

app.get("/login", (req, res) => {
  let templateVars = { user: users[req.cookies['user_id']]};
  res.render("login_show", templateVars);
});

app.get("/urls", (req, res) => {
  let shortenedurlDatabase =  {};
  for (var url in urlDatabase) {
    if (urlDatabase[url].creator === req.cookies.user_id) {
      shortenedurlDatabase[url] = urlDatabase[url].longURL;
    }
  }
  let templateVars = { user: users[req.cookies['user_id']], urls: shortenedurlDatabase };
  console.log(templateVars)
  console.log(urlDatabase)
  res.render('urls_index', templateVars);
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { user: users[req.cookies['user_id']], allurls: urlDatabase, shortURL: req.params.id, owner: (urlDatabase[req.params.id].creator === req.cookies.user_id) };
  res.render("urls_show", templateVars);
});


app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString(n) {
  let result = '';
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let i = n; i > 0; --i) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}














