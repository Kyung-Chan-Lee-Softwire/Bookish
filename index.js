const database = require('./DataBase').DataBase;

const express = require('express');
const passport = require('passport')


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
    database.sequelize.sync();
    database.users.findOne({ where: { loginName: jwt_payload.id } }).then((user, err) => {

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
    database.sequelize.sync();
    let id = req.query.id;
    let password = req.query.password;

    if (id == undefined || password == undefined) {
        console.log("Missing password or id");
        return;
    }

    database.users.findOne({ where: { loginName: id } }).then((userData) => {

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

require('./APIGetters').addGetters(app, database, passport);
require('./APIPosters').addPosters(app, database, passport);
require('./APIBorrowReturn').addBorrow(app, database, passport);
require('./APIBorrowReturn').addReturn(app, database, passport);

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
