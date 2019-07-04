//TODO: Deal with Borrowing and Returning
const moment = require('moment')

function addBorrow(app, database, passport) {
    app.put(`/Bookish/Borrow`, passport.authenticate('jwt', { session: false }), (req, res) => {
        database.sequelize.sync();
        database.books.findOne({ where: { id: req.query.id } })
            .then(bookdata => {
                let returnDate = moment();
                returnDate.add(14, 'days');
                return bookdata.update({
                    userLoginName: req.query.userLoginName,
                    dueDate: returnDate.format('DD-MM-YYYY')
                });
            })
            .then(bookdataPromise => res.send(bookdataPromise))
        database.sequelize.sync();
    });
}
function addReturn(app, database, passport) {
    app.put(`/Bookish/Return`, passport.authenticate('jwt', { session: false }), (req, res) => {
        database.sequelize.sync();
        database.books.findOne({ where: { id: req.query.id } })
            .then(bookdata => {
                return bookdata.update({
                    userLoginName: null,
                    dueDate: null
                });
            })
            .then(bookdataPromise => res.send(bookdataPromise))
        database.sequelize.sync();
    });
}

module.exports.addBorrow = addBorrow; 
module.exports.addReturn = addReturn; 