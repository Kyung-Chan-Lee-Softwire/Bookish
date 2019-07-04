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
    database.publishers.create({
        name: 'None'
    });
    for (i = 1; i < rawInputData.length; i++) {
        let processedData = rawInputData[i].split(',');
        console.log(processedData[2]);
        database.authors.create({
            name: processedData[2]
        });
    }
    // for (i = 1; i < rawInputData.length; i++) {
    //     let processedData = rawInputData[i].split(',');
    //     if(isNaN(processedData[7])){
    //         continue;
    //     }
    //     if(ISBNList.includes(processedData[7])){
    //         continue;
    //     }
    //     ISBNList.push(processedData[7]);
    //     Promise.all([database.authors.findOne({ where: { name: processedData[2] } }), database.publishers.findOne({ where: { name: "None" } })])
    //         .then((authorPublisherData) => {
    //             if (authorPublisherData[0] == undefined) {
    //                 console.log('No author with that name found');
    //             } else if (authorPublisherData[1] == undefined) {

    //                 console.log('No Publisher with that name found');
    //             }
    //             else {
    //                 // console.log(authorPublisherData[1].id);
    //                 database.book_temps.create({
    //                     ISBN: processedData[7],
    //                     title: processedData[1],
    //                     authorId: authorPublisherData[0].id,
    //                     publisherId: authorPublisherData[1].id,
    //                 })
    //             }
    //         });
    // }
    // for (i = 1; i < rawInputData.length; i++) {
    //     let processedData = rawInputData[i].split(',');
    //     if(isNaN(processedData[7])){
    //         continue
    //     }
    //     ISBNList.push(processedData[7]);
    //     database.book_temps.findOne({ where: { ISBN: processedData[7] } })
    //         .then((booktempData) => {
    //             database.books.create({
    //                 bookTempISBN : booktempData.isbn
    //             })
    //         });
    // }
    database.sequelize.sync();
}

function main() {
    processFile(readFile());
}

