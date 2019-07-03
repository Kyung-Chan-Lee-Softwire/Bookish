
function addPosters(app, database, passport) {
    app.post('/Bookish/publishers', passport.authenticate('jwt', { session: false }), (req, res) => {
        console.log(req.body);
        if (!req.body.name) {
            res.send("Publisher name not found");
            return;
        }

        database.sequelize.sync();

        database.publishers.create({
            name: req.body.name
        });

        database.sequelize.sync();

        res.send("successful");
    })

    app.post('/Bookish/users', passport.authenticate('jwt', { session: false }), (req, res) => {
        console.log(req.body);
        if (!req.body.name) {
            res.send("User name not found");
            return;
        }

        database.sequelize.sync();

        database.users.create({
            name: req.body.name,
            loginName: req.body.loginName,
            loginPW: req.body.loginPW
        });

        database.sequelize.sync();

        res.send("successful");
    })

    app.post('/Bookish/book_temps', passport.authenticate('jwt', { session: false }), (req, res) => {
        console.log(req.body);

        // Input should have .author .isbn .title .publisher

        database.sequelize.sync();

        // ISBN Title Publisher Authors

        Promise.all([database.authors.findOne({ where: { name: req.body.author } }), database.publishers.findOne({ where: { name: req.body.publisher } })])
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
                    database.book_temps.create({
                        ISBN: req.body.ISBN,
                        title: req.body.title,
                        authorId: authorPublisherData[0].id,
                        publisherId: authorPublisherData[1].id,
                    })
                }
            });

        //TODO: Error check

        database.sequelize.sync();

        res.send("successful");
    })

    app.post('/Bookish/books', passport.authenticate('jwt', { session: false }), (req, res) => {
        console.log(req.body.count);

        database.sequelize.sync();

        database.books.create({
            bookTempISBN: req.body.ISBN,
            dueDate: null,
            userLoginName: null
        });

        if (req.body.count) {
            for (i = 1; i < req.body.count; i++) {
                database.books.create({
                    bookTempISBN: req.body.ISBN,
                    dueDate: null,
                    userLoginName: null
                });
            }
        }

        database.sequelize.sync();

        res.send("successful");
    })

    app.post('/Bookish/authors', passport.authenticate('jwt', { session: false }), (req, res) => {
        console.log(req.body);
        if (!req.body.name) {
            res.send("Author name not found");
            return;
        }

        database.sequelize.sync();

        database.authors.create({
            name: req.body.name
        });

        database.sequelize.sync();

        res.send("successful");
    })
}

module.exports.addPosters = addPosters; 