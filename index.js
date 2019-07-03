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


var books = sequelize.define('books', {
  dueDate: Sequelize.STRING
});

books.belongsTo(book_temps);
books.belongsTo(users);

// users.create({
//   name: 'Lukas Zierahn',
//   loginName: 'Lukas',
//   loginPW: 'Zierahn'
// })

sequelize.sync();

//Server Stuff
const app = express();
const cors = require('cors');
const port = 3000;

const JwtStrategy = require('passport-jwt').Strategy;
const jwt = require('jsonwebtoken');
var bodyParser = require("body-parser");


app.use(express.static('frontend'));
app.use(passport.initialize());
app.use(bodyParser.json());


app.use(cors());

function extractJwtCookie(req) {
  if (!req.headers.cookie) return;
  let cookies = req.headers.cookie.split('=');
  return cookies[1];
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

app.post('/Bookish/AddAuthor', passport.authenticate('jwt', { session: false }), (req, res) => {
  console.log(req.body);
  if (!req.body.name) {
    res.send("Author name not found");
    return;
  }

  sequelize.sync();

  authors.create({
    name: req.body.name
  });

  sequelize.sync();

  res.send("successful");
})

app.post('/Bookish/AddPublisher', passport.authenticate('jwt', { session: false }), (req, res) => {
  console.log(req.body);
  if (!req.body.name) {
    res.send("Publisher name not found");
    return;
  }

  sequelize.sync();

  publishers.create({
    name: req.body.name
  });

  sequelize.sync();

  res.send("successful");
})

app.post('/Bookish/AddUser', passport.authenticate('jwt', { session: false }), (req, res) => {
  console.log(req.body);
  if (!req.body.name) {
    res.send("User name not found");
    return;
  }

  sequelize.sync();

  users.create({
    name: req.body.name,
    loginName: req.body.loginName,
    loginPW: req.body.loginPW
  });

  sequelize.sync();

  res.send("successful");
})

app.post('/Bookish/AddBookTemp', passport.authenticate('jwt', { session: false }), (req, res) => {
  console.log(req.body);

  // Input should have .author .isbn .title .publisher

  sequelize.sync();

  // ISBN Title Publisher Authors

  Promise.all([authors.findOne({ where: { name: req.body.author } }), publishers.findOne({ where: { name: req.body.publisher } })])
    .then((authorPublisherData) => {
      if (authorPublisherData[0] == undefined) {
        console.log('No author with that name found');
        res.send("author name not found");
      } else if (authorPublisherData[1] == undefined) {

        console.log('No Publisher with that name found');
        res.send("Publisher name not found");
      }
      else {
        console.log(authorPublisherData[1].id);
        book_temps.create({
          ISBN: req.body.ISBN,
          title: req.body.title,
          authorId: authorPublisherData[0].id,
          publisherId: authorPublisherData[1].id,
        })
      }
    });

  //TODO: Error check

  sequelize.sync();

  res.send("successful");
})

app.post('/Bookish/AddBook', passport.authenticate('jwt', { session: false }), (req, res) => {
  console.log(req.body.count);

  sequelize.sync();

  books.create({
    bookTempISBN: req.body.ISBN,
    dueDate: null,
    userLoginName: null
  });

  if (req.body.count) {
    for (i = 1; i < req.body.count; i++) {
      books.create({
        bookTempISBN: req.body.ISBN,
        dueDate: null,
        userLoginName: null
      });
    }
  }

  sequelize.sync();

  res.send("successful");
})