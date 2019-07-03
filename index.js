const Sequelize = require('sequelize');
const express = require('express');
const passport = require('passport')
const keys = require('./IDPW');

const sequelize = new Sequelize(`postgres://${keys.id}:${keys.pw}@localhost:5432/bookish`, {
  logging: false
});

var authors = sequelize.define('authors', {
  name: Sequelize.STRING
});


var publishers = sequelize.define('publishers', {
  name: Sequelize.STRING
});


var users = sequelize.define('users', {
  name: Sequelize.STRING,
  loginName: {
    type: Sequelize.STRING,
    primaryKey: true,
    unique: true
  },
  loginPW: Sequelize.STRING
});


var book_temps = sequelize.define('book_temps', {
  ISBN: {
    type: Sequelize.STRING(13),
    primaryKey: true,
    unique: true
  },
  title: Sequelize.STRING,
});

book_temps.belongsTo(publishers);
book_temps.belongsTo(authors);


var book = sequelize.define('book', {
});

book.belongsTo(book_temps);
book.belongsTo(users);

// users.create({
//   name: 'Whatever',
//   loginName: 'Whatever2',
//   loginPW: 'Whatever3'
// })

sequelize.sync();

//Server Stuff
const app = express();
const cors = require('cors');
const port = 3000;

const JwtStrategy = require('passport-jwt').Strategy;
const { ExtractJwt } = require('passport-jwt');
const jwt = require('jsonwebtoken');
var bodyParser = require("body-parser");


app.use(express.static('frontend'));
app.use(passport.initialize());
app.use(bodyParser.json());
//app.use(express.cookieParser());


app.use(cors());

function extractJwtCookie(req) {
  if (!req.headers.cookie) return;
  let cookies = req.headers.cookie.split('=');
  return cookies[1];
  // return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IldoYXRldmVyMiIsImlhdCI6MTU2MjE1OTkxNiwiZXhwIjoxODIxMzU5OTE2fQ.Dzp6QKg0n1uQ5vmsKJERRxYcXhxGSiGVbeIuutOfWpI";
}

let opts = {}
opts.jwtFromRequest = extractJwtCookie;
opts.secretOrKey = 'secret';

passport.use(new JwtStrategy(opts, function (jwt_payload, done) {
  sequelize.sync();
  users.findOne({ where: { loginName: jwt_payload.id } }).then((user, err) => {

    if (err) {
      return done(err, false);
    }

    if (user) {
      return done(null, user);
    } else {
      return done(null, false);
    }
  });
}));


app.get('/login', (req, res) => {
  sequelize.sync();
  let id = req.query.id;
  let password = req.query.password;

  if (id == undefined || password == undefined) {
    console.log("Missing password or id");
    return;
  }

  users.findOne({ where: { loginName: id } }).then((userData) => {

    if (userData == undefined) {
      console.log('No user with that name found');
    } else if (password != userData.loginPW) {
      console.log('invalid pw');
    } else {

      var payload = { 'id': userData.loginName };
      var token = jwt.sign(payload, opts.secretOrKey);

      res.setHeader("Authorization", `Bearer ${token}`);
      res.cookie("jwt", token);
      res.json({ message: "ok", token: token });

    }
  })
})

app.get('/Bookish/AllBooks', passport.authenticate('jwt', { session: false }), (req, res) => {

  sequelize.sync();
  authors.findAll().then((authorData) => res.send(authorData));
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));

