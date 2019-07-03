const keys = require('./IDPW');

const Sequelize = require('sequelize');

class DataBase {
    
    constructor() {
        this.sequelize = new Sequelize(`postgres://${keys.id}:${keys.pw}@localhost:5432/bookish`, {
            logging: false
        });    

        this.authors = this.sequelize.define('authors', {
            name: Sequelize.STRING
        });

        this.publishers = this.sequelize.define('publishers', {
            name: Sequelize.STRING
        });


        this.users = this.sequelize.define('users', {
            name: Sequelize.STRING,
            loginName: {
                type: Sequelize.STRING,
                primaryKey: true,
                unique: true
            },
            loginPW: Sequelize.STRING
        });


        this.book_temps = this.sequelize.define('book_temps', {
            ISBN: {
                type: Sequelize.STRING(13),
                primaryKey: true,
                unique: true
            },
            title: Sequelize.STRING,
        });

        this.book_temps.belongsTo(this.publishers);
        this.book_temps.belongsTo(this.authors);


        this.books = this.sequelize.define('books', {
            dueDate: Sequelize.STRING
        });

        this.books.belongsTo(this.book_temps);
        this.books.belongsTo(this.users);

        // users.create({
        //   name: 'Lukas Zierahn',
        //   loginName: 'Lukas',
        //   loginPW: 'Zierahn'
        // })

        this.sequelize.sync();
    }
}

module.exports.DataBase = new DataBase();