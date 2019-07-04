const path = require('path');
const fs = require('fs');
const filename = 'books.csv';
const filepath = path.join(__dirname, './', filename);
let ISBNList = [];
const database = require('./DataBase').DataBase;

main();

function readFile() {
    return fs.readFileSync(filepath, { encoding: 'utf-8' }).split("\n");
}

function processFile(rawInputData) {
    database.sequelize.sync();

    let header = rawInputData[0].toLowerCase().replace("\"", "").split(',');
    let authorIndex = header.findIndex((element) => element == "author");
    let publisherIndex = header.findIndex((element) => element == "publisher");
    let ISBNIndex = header.findIndex((element) => element == "isbn");
    let titleIndex = header.findIndex((element) => element == "title");

    for (i = 1; i < rawInputData.length; i++) {
        let processedData = rawInputData[i].split(',');
        bookInfo = [new Promise((resolve) => { resolve(null); }), new Promise((resolve) => { resolve(null); })];

        if (processedData.length == 0) {
            continue;
        }

        if (processedData[authorIndex] != undefined) {
            bookInfo[0] = (database.authors.findOrCreate({
                where: { name: processedData[authorIndex] },
                defaults: { name: processedData[authorIndex] }
            }))
        }

        if (processedData[publisherIndex] != undefined) {
            bookInfo[1] = (database.authors.findOrCreate({
                where: { name: processedData[publisherIndex] },
                defaults: { name: processedData[publisherIndex] }
            }))
        }

        Promise.all(bookInfo).then(([authorIdNew, publisherIdNew]) => {

            if (processedData[ISBNIndex] == undefined || isNaN(processedData[ISBNIndex]) || processedData[ISBNIndex].length < 5) {
                return;
            }


            database.book_temps.findOrCreate({
                where: {
                    ISBN: processedData[ISBNIndex],
                    title: processedData[titleIndex],
                    authorId: authorIdNew[0].id,
                    publisherId: 2,
                },
                defaults: {
                    ISBN: processedData[ISBNIndex],
                    title: processedData[titleIndex],
                    authorId: authorIdNew[0].id,
                    publisherId: 2,
                }
            }).then(
                database.books.create({
                    bookTempISBN: processedData[ISBNIndex]
                })
            );
        })
    }
    database.sequelize.sync();
}

function main() {
    processFile(readFile());
}

