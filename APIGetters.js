
function addGetters(app, database, passport) {

    for (let table of [database.authors, database.users, database.books, database.book_temps, database.publishers]) {

        app.get(`/Bookish/${table.getTableName()}`, passport.authenticate('jwt', { session: false }), (req, res) => {

            database.sequelize.sync();

            table.findAll({ where: req.query }).then((data) => res.send(data));
        });
    }
}

module.exports.addGetters = addGetters; 