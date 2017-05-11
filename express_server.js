//Requirements and Constants:
const express = require("express");
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');
const bodyParser = require("body-parser");

const app = express();

const PORT = process.env.PORT || 8080;

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['kfpoier0tu5g0rejgre', 'erljfo34if0jwfdkepf']
}));

app.set('trust proxy', 1);
app.set("view engine", "ejs");

const users = {};
const urlDatabase = {};

function generateRandomString(n) {
  let result = '';
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let i = n; i > 0; --i) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

//Post Requests:

app.post("/register", (req, res) => {
  let userId = generateRandomString(10);
  let alreadyregistered = false;
  for (user in users) {
    if (users[user].email === req.body.email) {
      alreadyregistered = true;
    }
  }
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

  users[userId] = {id: userId, email: req.body.email, password: bcrypt.hashSync(req.body.password, 10) };
  console.log(users);
  req.session.user_id = userId;
  res.redirect('urls/');
});


app.post("/urls", (req, res) => {
  console.log(req.body);
  let shortURL = generateRandomString(6);
  urlDatabase[shortURL] = { longURL: req.body.longURL, creator: req.session.user_id};
  res.redirect('urls/' + shortURL);
});

app.post("/login", (req, res) => {
  let alreadyregistered = false;
  let userId = '';
  for (var user in users) {
    if (users[user].email === req.body.email) {
      alreadyregistered = true;
      userId = user;
    }
  }
  if (!alreadyregistered) {
    res.status(403);
    res.send('Email not found.');
  }

  if (!(bcrypt.compareSync(req.body.password, users[userId].password))) {
    res.status(403);
    res.send('Incorrect password.');
  }
  req.session.user_id = userId;
  res.redirect('/urls/');
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/urls/');
});

app.post("/urls/:id/delete", (req, res) => {
  if (urlDatabase[req.params.id].creator === req.session.user_id) {
    delete urlDatabase[req.params.id];
  }
  res.redirect('/urls');
});

app.post("/urls/:id/update", (req, res) => {
  if (urlDatabase[req.params.id].creator === req.session.user_id){
    urlDatabase[req.params.id].longURL = req.body.newlongURL;
  }
  res.redirect('/urls');
});

//Get Requests:

app.get("/urls/new", (req, res) => {
  let templateVars = { user: users[req.session.user_id] };
  if (undefined === req.session.user_id) {
    res.redirect('/login');
  }
  res.render("urls_new", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    res.status(400);
    res.send('Invalid Short URL');
  } else {
    let longURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect("https://" + longURL);
  }
});

app.get("/", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

app.get("/register", (req, res) => {
  let templateVars = { user: users[req.session.user_id] };
  res.render("register_show", templateVars);
});

app.get("/login", (req, res) => {
  let templateVars = { user: users[req.session.user_id] };
  res.render("login_show", templateVars);
});

app.get("/urls", (req, res) => {
  let shortenedurlDatabase =  {};
  for (var url in urlDatabase) {
    if (urlDatabase[url].creator === req.session.user_id) {
      shortenedurlDatabase[url] = urlDatabase[url].longURL;
    }
  }
  let templateVars = { user: users[req.session.user_id], urls: shortenedurlDatabase };
  res.render('urls_index', templateVars);
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { user: users[req.session.user_id], allurls: urlDatabase, shortURL: req.params.id, owner: (urlDatabase[req.params.id].creator === req.session.user_id) };
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Tiny App listening on port ${PORT}!`);
});













