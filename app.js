const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const nocache = require('nocache')

const app = express();
const PORT = process.env.PORT || 3000;

const person = {
  email: 'mshahilt3@gmail.com',
  password: '123'  // Ensure this is a string
};

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

// Session configuration
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true,
}));

// Middleware to set no-cache headers
app.use(nocache());

// Middleware to check if the user is logged in
function isAuthenticated(req, res, next) {
  if (req.session.user) {
    return next();
  } else {
    res.redirect('/');
  }
}

// Routes
app.get('/', (req, res) => {
  if (req.session.user) {
    res.redirect('/dashboard');
  } else {
    const errorMessage = req.session.errorMessage || '';
    delete req.session.errorMessage;
    res.render('login',{errorMessage});
  }
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (email === person.email && password === person.password) {
    req.session.user = email;  // Assign user to session
    res.redirect('/dashboard');
  } else {
    req.session.errorMessage = 'Invalid email or password. Please try again. ';
    res.redirect('/');
  }
});

app.get('/dashboard', isAuthenticated, (req, res) => {  // Fixed route
  res.render('dashboard', { email: req.session.user });
});

app.get('/logout', (req, res) => {  // Fixed route
  req.session.destroy(err => {
    if (err) {
      return res.redirect('/dashboard');
    }
    res.redirect('/');
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
