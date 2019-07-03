
function addGetters(app, database, passport) {
    app.get('/Bookish/authors', passport.authenticate('jwt', { session: false }), (req, res) => {

        database.sequelize.sync();
        database.authors.findAll().then((authorData) => res.send(authorData));
    });
}

module.exports.addGetters = addGetters; 