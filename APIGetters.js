
function addGetters(app, database, passport) {

    for (let table of [database.authors, database.users, database.books, database.book_temps, database.publishers]) {

        app.get(`/Bookish/${table.getTableName()}`, passport.authenticate('jwt', { session: false }), (req, res) => {

            database.sequelize.sync();

            table.findAll({ where: req.query }).then((data) => res.send(data.sort((a, b) => {
                switch (table.getTableName()) {
                    case 'authors':
                        return a.name > b.name;
                    case 'publishers':
                        return a.name > b.name;
                    case 'users':
                        return a.name > b.name;
                    case 'book_temps':
                        return a.title > b.title;
                    case 'books':
                        return a.id > b.id;
                }
            })));
        });
    }
}

module.exports.addGetters = addGetters; 