const path = require('path');
const fs = require('fs');
const filename = 'books.csv';
const filepath = path.join(__dirname, './', filename);
let ISBNList = [];
const database = require('./DataBase').DataBase;
const parse  = require("csv-parse/lib/sync");

main();

function readFile() {
    return fs.readFileSync(filepath, { encoding: 'utf-8' });
}

async function processFile(rawInputData) {
    database.sequelize.sync();

    let line = parse(rawInputData);

    let authorIndex = line[0].findIndex((element) => element == "author");
    let publisherIndex = line[0].findIndex((element) => element == "publisher");
    let ISBNIndex = line[0].findIndex((element) => element == "isbn");
    let titleIndex = line[0].findIndex((element) => element == "title");

    for (i = 1; i < line.length; i++) {
        let processedData = line[i];
        bookInfo = [[{ id: null }], [{ id: null }]];

        console.log(processedData);
        console.log(authorIndex, publisherIndex, ISBNIndex, titleIndex);

        if (processedData.length == 0) {
            continue;
        }

        if (processedData[authorIndex] != undefined) {
            bookInfo[0] = await (database.authors.findOrCreate({
                where: { name: processedData[authorIndex] },
                defaults: { name: processedData[authorIndex] }
            }))
        }

        if (processedData[publisherIndex] != undefined) {
            bookInfo[1] = await (database.authors.findOrCreate({
                where: { name: processedData[publisherIndex] },
                defaults: { name: processedData[publisherIndex] }
            }))
        }

        if (processedData[ISBNIndex] == undefined || isNaN(processedData[ISBNIndex]) || processedData[ISBNIndex].length < 5) {
            continue;
        }

        console.log(processedData[ISBNIndex], processedData[titleIndex]);
        console.log(bookInfo[0][0].id, bookInfo[1][0].id);

        let ISBNId = await database.book_temps.findOrCreate({
            where: {
                ISBN: processedData[ISBNIndex],
            },
            defaults: {
                ISBN: processedData[ISBNIndex],
                title: processedData[titleIndex],
                authorId: bookInfo[0][0].id,
                publisherId: bookInfo[1][0].id,
            }

        });

        await database.books.create({
            bookTempISBN: processedData[ISBNIndex]
        })

    }
    database.sequelize.sync();
}

function main() {
    processFile(readFile());
}

